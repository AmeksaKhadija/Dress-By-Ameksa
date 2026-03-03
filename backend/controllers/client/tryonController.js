const TryOn = require('../../models/TryOn');
const Tenue = require('../../models/Tenue');
const { cloudinary } = require('../../config/cloudinary');
const { generateTryOnImage } = require('../../utils/gemini');

// @desc    Generate virtual try-on image
// @route   POST /api/client/tryon
exports.generateTryOn = async (req, res, next) => {
  try {
    const { tenueId, taille, poids, couleurPeau, morphologie } = req.body;

    if (!tenueId || !taille || !poids || !couleurPeau || !morphologie) {
      return res.status(400).json({
        success: false,
        message: 'Tous les champs sont requis',
      });
    }

    if (taille < 100 || taille > 220) {
      return res.status(400).json({
        success: false,
        message: 'La taille doit etre entre 100 et 220 cm',
      });
    }
    if (poids < 30 || poids > 200) {
      return res.status(400).json({
        success: false,
        message: 'Le poids doit etre entre 30 et 200 kg',
      });
    }

    const validCouleurs = ['tres_claire', 'claire', 'moyenne', 'mate', 'foncee', 'tres_foncee'];
    if (!validCouleurs.includes(couleurPeau)) {
      return res.status(400).json({ success: false, message: 'Couleur de peau invalide' });
    }

    const validMorphologies = ['sablier', 'triangle', 'triangle_inverse', 'rectangle', 'ronde'];
    if (!validMorphologies.includes(morphologie)) {
      return res.status(400).json({ success: false, message: 'Morphologie invalide' });
    }

    const tenue = await Tenue.findById(tenueId);
    if (!tenue) {
      return res.status(404).json({ success: false, message: 'Tenue non trouvee' });
    }

    // Call AI to generate try-on image
    let aiResult;
    try {
      aiResult = await generateTryOnImage(
        tenue,
        { taille, poids, couleurPeau, morphologie }
      );
    } catch (aiError) {
      console.error('Erreur AI:', aiError.message);
      return res.status(502).json({
        success: false,
        message: 'L\'IA n\'a pas pu generer l\'image. Veuillez reessayer.',
        error: aiError.message,
      });
    }

    // Upload to Cloudinary if configured, otherwise use data URL
    let imageUrl;
    let imagePublicId = '';

    if (process.env.CLOUDINARY_CLOUD_NAME) {
      try {
        const cloudinaryResult = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder: 'dressByAmeksa/tryon', resource_type: 'image', format: 'png' },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          const buffer = Buffer.from(aiResult.imageBase64, 'base64');
          uploadStream.end(buffer);
        });
        imageUrl = cloudinaryResult.secure_url;
        imagePublicId = cloudinaryResult.public_id;
      } catch (uploadError) {
        console.error('Erreur Cloudinary upload:', uploadError.message);
        // Fallback to data URL
        imageUrl = `data:${aiResult.mimeType};base64,${aiResult.imageBase64}`;
      }
    } else {
      imageUrl = `data:${aiResult.mimeType};base64,${aiResult.imageBase64}`;
    }

    // Save to database
    const tryOn = await TryOn.create({
      client: req.user._id,
      tenue: tenueId,
      taille,
      poids,
      couleurPeau,
      morphologie,
      imageGeneree: {
        url: imageUrl,
        public_id: imagePublicId,
      },
      promptUtilise: aiResult.prompt,
      statut: 'terminee',
    });

    res.status(201).json({
      success: true,
      message: 'Image generee avec succes',
      tryOn,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get client's try-on history
// @route   GET /api/client/tryon
exports.getMyTryOns = async (req, res, next) => {
  try {
    const tryOns = await TryOn.find({ client: req.user._id })
      .populate('tenue', 'nom type images prix')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({ success: true, tryOns });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single try-on
// @route   GET /api/client/tryon/:id
exports.getTryOnById = async (req, res, next) => {
  try {
    const tryOn = await TryOn.findOne({
      _id: req.params.id,
      client: req.user._id,
    }).populate('tenue', 'nom type images prix boutique');

    if (!tryOn) {
      return res.status(404).json({ success: false, message: 'Essayage non trouve' });
    }

    res.json({ success: true, tryOn });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a try-on record
// @route   DELETE /api/client/tryon/:id
exports.deleteTryOn = async (req, res, next) => {
  try {
    const tryOn = await TryOn.findOne({
      _id: req.params.id,
      client: req.user._id,
    });

    if (!tryOn) {
      return res.status(404).json({ success: false, message: 'Essayage non trouve' });
    }

    if (tryOn.imageGeneree?.public_id) {
      await cloudinary.uploader.destroy(tryOn.imageGeneree.public_id).catch(() => {});
    }

    await tryOn.deleteOne();
    res.json({ success: true, message: 'Essayage supprime' });
  } catch (error) {
    next(error);
  }
};
