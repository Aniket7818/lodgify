const Listing = require("../models/listing.js");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res) => {
  const allListing = await Listing.find({});
  res.render("listings/index.ejs", { allListing });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: { path: "author" },
    })
    .populate("owner");

  if (!listing) {
    req.flash("error", "The page you're looking for doesn't exist.");
    return res.redirect("/listings");
  }

  res.render("listings/show.ejs", { listing });
};
module.exports.createListing = async (req, res, next) => {
  try {
    console.log("MAP TOKEN:", process.env.MAP_TOKEN);
    console.log("REQ.BODY:", req.body);
    console.log("REQ.FILE:", req.file); // Check if image is uploaded

    // Geocode the location
    const response = await geocodingClient
      .forwardGeocode({
        query: req.body.listing.location,
        limit: 1,
      })
      .send();

    const geometry = response.body.features[0]?.geometry;
    if (!geometry) {
      console.error("Geocoding failed: No geometry found.");
      throw new Error("Could not find location.");
    }

    // Handle Cloudinary upload
    const url = req.file?.path || "";
    const filename = req.file?.filename || "";

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };
    newListing.geometry = geometry;

    await newListing.save();

    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
  } catch (error) {
    console.error("Error creating listing:", error);
    next(error); // Express will handle this error
  }
};

module.exports.editListing = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "The page you're looking for doesn't exist.");
    return res.redirect("/listings");
  }

  const originalImageUrl = listing.image.url.replace(
    "/upload",
    "/upload/w_250"
  );
  res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
  if (!req.body.listing) {
    req.flash("error", "Invalid data provided.");
    return res.redirect("/listings");
  }

  const { id } = req.params;
  const listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

  if (req.file) {
    const url = req.file.path;
    const filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
  }

  req.flash("success", "Listing Updated!");
  res.redirect(`/listings/${id}`);
};

const { cloudinary } = require("../cloudConfig");

module.exports.deleteListing = async (req, res) => {
  const { id } = req.params;

  const listing = await Listing.findById(id);
  if (listing?.image?.filename) {
    // Deletes the image from Cloudinary
    await cloudinary.uploader.destroy(listing.image.filename);
  }

  await Listing.findByIdAndDelete(id);

  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
};
