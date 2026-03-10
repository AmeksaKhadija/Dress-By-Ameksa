const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const Boutique = require('./models/Boutique');
const Tenue = require('./models/Tenue');
const Reservation = require('./models/Reservation');
const { cloudinary } = require('./config/cloudinary');

// Upload image from URL to Cloudinary
const uploadImage = async (imageUrl, publicId) => {
  const result = await cloudinary.uploader.upload(imageUrl, {
    public_id: publicId,
    folder: 'dressByAmeksa',
    overwrite: true,
  });
  return { url: result.secure_url, public_id: result.public_id };
};

// Upload images in batches to avoid rate limits
const uploadBatch = async (items, batchSize = 5) => {
  const results = {};
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(({ key, url }) => uploadImage(url, `seed/${key}`))
    );
    batch.forEach(({ key }, idx) => {
      results[key] = batchResults[idx];
    });
    console.log(`  Uploaded ${Math.min(i + batchSize, items.length)}/${items.length} images...`);
  }
  return results;
};

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connecte');

    // Clear existing data
    await User.deleteMany({});
    await Boutique.deleteMany({});
    await Tenue.deleteMany({});
    await Reservation.deleteMany({});
    console.log('Donnees existantes supprimees');

    // Clean old seed images from Cloudinary
    console.log('Nettoyage des anciennes images Cloudinary...');
    try {
      await cloudinary.api.delete_resources_by_prefix('dressByAmeksa/seed');
    } catch (err) {
      // Ignore if no resources found
    }

    // --- UPLOAD ALL IMAGES TO CLOUDINARY ---
    console.log('Upload des images vers Cloudinary...');
    const allImages = [
      // Boutique logos
      { key: 'logo_dar_al_caftan', url: 'https://images.unsplash.com/photo-1769717476866-ac3717d1b314?w=200&h=200&fit=crop' },
      { key: 'logo_marrakech_prestige', url: 'https://images.unsplash.com/photo-1772411535291-aa5884035934?w=200&h=200&fit=crop' },
      { key: 'logo_fes_haute_couture', url: 'https://images.unsplash.com/photo-1772411534911-504e649deeae?w=200&h=200&fit=crop' },
      // Tenue images
      { key: 'caftan_royal_1', url: 'https://www.e-mosaik.com/cdn/shop/products/1_14504122_master_dxgqyiikhn6d1gsk_600x.jpg?v=1649856606' },
      { key: 'caftan_royal_2', url: 'https://www.e-mosaik.com/cdn/shop/products/13168771_master_2p5r9irkwt7pn80u_600x.jpg?v=1649863936' },
      { key: 'caftan_bleu_1', url: 'https://www.e-mosaik.com/cdn/shop/products/1_13907612_master_9rquequq7r0cspbk_600x.jpg?v=1649844673' },
      { key: 'caftan_bleu_2', url: 'https://www.e-mosaik.com/cdn/shop/products/23210602_master_qpfwpnvobgtmthso_600x.jpg?v=1649787953' },
      { key: 'caftan_noir_1', url: 'https://www.e-mosaik.com/cdn/shop/products/BL69_1_xl_600x.jpg?v=1520243497' },
      { key: 'caftan_noir_2', url: 'https://www.e-mosaik.com/cdn/shop/products/1_20407252_master_zjf38lrnn2agnxgz_600x.jpg?v=1651164182' },
      { key: 'caftan_rose_1', url: 'https://www.e-mosaik.com/cdn/shop/products/8144123_master_600x.jpg?v=1522089329' },
      { key: 'caftan_rose_2', url: 'https://www.e-mosaik.com/cdn/shop/products/1_18305762_master_khdlbr1kdq3nxmuv_600x.jpg?v=1649843410' },
      { key: 'caftan_bordeaux_1', url: 'https://www.e-mosaik.com/cdn/shop/products/1_20227632_master_ujh3btawdybnag7v_600x.jpg?v=1649836815' },
      { key: 'caftan_bordeaux_2', url: 'https://www.e-mosaik.com/cdn/shop/products/14061022_master_p3a3eu46jslhw8y8_600x.jpg?v=1649862228' },
      { key: 'takchita_doree_1', url: 'https://www.e-mosaik.com/cdn/shop/products/1_20227612_master_rpjwwswan8lmyghu_600x.jpg?v=1649836364' },
      { key: 'takchita_doree_2', url: 'https://www.e-mosaik.com/cdn/shop/products/23196372_master_onsk9ud3xb6w8lia_600x.jpg?v=1649787806' },
      { key: 'takchita_blanche_1', url: 'https://www.e-mosaik.com/cdn/shop/products/1_23210062_master_f9fed9t1svvjdupk_600x.jpg?v=1649940466' },
      { key: 'takchita_blanche_2', url: 'https://www.e-mosaik.com/cdn/shop/products/12788232_master_7jpmgpxh34thnesk_600x.jpg?v=1649849304' },
      { key: 'robe_sahara_1', url: 'https://www.e-mosaik.com/cdn/shop/products/1_f_26117662_1636857705998_bg_processed_czdwjgn0q95zcjgn_600x.jpg?v=1650374264' },
      { key: 'robe_sahara_2', url: 'https://www.e-mosaik.com/cdn/shop/products/1_13878561_master_jhdfs2hl3iejmjp4_600x.jpg?v=1649848438' },
      { key: 'takchita_turquoise_1', url: 'https://www.e-mosaik.com/cdn/shop/products/10021103_master_600x.jpg?v=1522075305' },
      { key: 'takchita_turquoise_2', url: 'https://www.e-mosaik.com/cdn/shop/products/1_12945401_master_1tgugiipxffevp7c_600x.jpg?v=1651164324' },
      { key: 'robe_nuit_1', url: 'https://www.e-mosaik.com/cdn/shop/products/13907582_master_ymnhoro2okary1eu_600x.jpg?v=1649854483' },
      { key: 'robe_nuit_2', url: 'https://www.e-mosaik.com/cdn/shop/products/1_18305392_master_eccoe7uqkkn9bnsk_600x.jpg?v=1649836959' },
      { key: 'caftan_fassi_1', url: 'https://www.e-mosaik.com/cdn/shop/products/1_22069352_master_j5lsn5jpassqkul5_600x.jpg?v=1649835630' },
      { key: 'caftan_fassi_2', url: 'https://www.e-mosaik.com/cdn/shop/products/7739473_l_600x.jpg?v=1522105754' },
      { key: 'takchita_zellige_1', url: 'https://www.e-mosaik.com/cdn/shop/products/10020583_master_600x.jpg?v=1524593945' },
      { key: 'takchita_zellige_2', url: 'https://www.e-mosaik.com/cdn/shop/products/8247143_master_600x.jpg?v=1522082026' },
      { key: 'robe_andalouse_1', url: 'https://www.e-mosaik.com/cdn/shop/products/1_13907602_master_zwxumxyfmipqmejn_600x.jpg?v=1649845128' },
      { key: 'robe_andalouse_2', url: 'https://www.e-mosaik.com/cdn/shop/products/7803333_l_600x.jpg?v=1522089657' },
      { key: 'caftan_perle_1', url: 'https://www.e-mosaik.com/cdn/shop/products/1_9756441_master_bmzye5rzg2vqciyp_600x.jpg?v=1649858376' },
      { key: 'caftan_perle_2', url: 'https://www.e-mosaik.com/cdn/shop/products/1_14207122_master_gg1dmsgkdidrenxf_600x.jpg?v=1649862406' },
      { key: 'takchita_ambre_1', url: 'https://www.e-mosaik.com/cdn/shop/products/1_f_27864692_1647702163986_bg_processed_oojbalwerls22w57_600x.jpg?v=1649859418' },
      { key: 'takchita_ambre_2', url: 'https://www.e-mosaik.com/cdn/shop/products/bright_hippie_chic_turkish_red_vest_1_600x.jpg?v=1519961102' },
    ];

    const img = await uploadBatch(allImages, 5);
    console.log('Toutes les images uploadees sur Cloudinary');

    // --- USERS ---
    const admin = await User.create({
      nom: 'Admin Ameksa',
      email: 'admin@dressByAmeksa.com',
      motDePasse: 'admin123',
      role: 'admin',
      telephone: '0600000000',
      adresse: 'Casablanca, Maroc',
    });

    const vendeur1 = await User.create({
      nom: 'Fatima Zahra El Amrani',
      email: 'fatima@boutique.com',
      motDePasse: 'vendeur123',
      role: 'vendeur',
      telephone: '0661234567',
      adresse: 'Derb Omar, Casablanca',
    });

    const vendeur2 = await User.create({
      nom: 'Khadija Bennis',
      email: 'khadija@boutique.com',
      motDePasse: 'vendeur123',
      role: 'vendeur',
      telephone: '0677654321',
      adresse: 'Gueliz, Marrakech',
    });

    const vendeur3 = await User.create({
      nom: 'Naima Tazi',
      email: 'naima@boutique.com',
      motDePasse: 'vendeur123',
      role: 'vendeur',
      telephone: '0655112233',
      adresse: 'Ville Nouvelle, Fes',
    });

    const client1 = await User.create({
      nom: 'Sara Idrissi',
      email: 'sara@client.com',
      motDePasse: 'client123',
      role: 'client',
      telephone: '0698765432',
      adresse: 'Hay Riad, Rabat',
    });

    const client2 = await User.create({
      nom: 'Amina Bouazza',
      email: 'amina@client.com',
      motDePasse: 'client123',
      role: 'client',
      telephone: '0612345678',
      adresse: 'Agdal, Rabat',
    });

    console.log('Utilisateurs crees (admin, 3 vendeurs, 2 clients)');

    // --- BOUTIQUES ---
    const boutique1 = await Boutique.create({
      nom: 'Dar Al Caftan',
      description:
        'Boutique specialisee dans les caftans traditionnels marocains haut de gamme. Nos creations allient savoir-faire ancestral et design contemporain pour sublimer chaque femme lors de ses evenements les plus precieux.',
      logo: img.logo_dar_al_caftan,
      adresse: 'Derb Omar, Casablanca',
      vendeur: vendeur1._id,
      statut: 'validee',
    });

    const boutique2 = await Boutique.create({
      nom: 'Marrakech Prestige',
      description:
        "Situee au coeur de Marrakech, notre boutique propose une collection exclusive de takchitas et robes de soiree. Chaque piece est confectionnee avec les meilleurs tissus et ornee de broderies fait main d'exception.",
      logo: img.logo_marrakech_prestige,
      adresse: 'Gueliz, Marrakech',
      vendeur: vendeur2._id,
      statut: 'validee',
    });

    const boutique3 = await Boutique.create({
      nom: 'Fes Haute Couture',
      description:
        'Heritiere du savoir-faire fassi, notre maison cree des tenues qui celebrent la richesse de la tradition marocaine. Specialistes du brocart et du sfifa, nous habillons les mariees et les invitees depuis 20 ans.',
      logo: img.logo_fes_haute_couture,
      adresse: 'Ville Nouvelle, Fes',
      vendeur: vendeur3._id,
      statut: 'validee',
    });

    console.log('3 boutiques creees');

    // --- TENUES ---
    const tenues = await Tenue.create([
      // Boutique 1 - Dar Al Caftan (5 tenues)
      {
        nom: 'Caftan Royal Emeraude',
        type: 'caftan',
        description:
          "Caftan en velours vert emeraude orne de broderies dorees sfifa et aakad. Coupe fluide et elegante, parfait pour les grandes occasions. Ceinture mdamma assortie incluse.",
        prix: 1500,
        tailles: ['S', 'M', 'L', 'XL'],
        couleurs: ['Vert emeraude', 'Dore'],
        images: [img.caftan_royal_1, img.caftan_royal_2],
        boutique: boutique1._id,
        disponible: true,
      },
      {
        nom: 'Caftan Bleu Majorelle',
        type: 'caftan',
        description:
          "Caftan en satin bleu majorelle avec broderies argentees. Design moderne inspire du style Art Deco de Marrakech. Ideal pour les soirees et receptions.",
        prix: 1200,
        tailles: ['XS', 'S', 'M', 'L'],
        couleurs: ['Bleu majorelle', 'Argente'],
        images: [img.caftan_bleu_1, img.caftan_bleu_2],
        boutique: boutique1._id,
        disponible: true,
      },
      {
        nom: 'Caftan Noir et Or',
        type: 'caftan',
        description:
          "Caftan en crepe noir rehausse de perles et fils d'or. Elegance sobre et raffinee pour les femmes qui aiment le chic intemporel.",
        prix: 1800,
        tailles: ['M', 'L', 'XL'],
        couleurs: ['Noir', 'Dore'],
        images: [img.caftan_noir_1, img.caftan_noir_2],
        boutique: boutique1._id,
        disponible: true,
      },
      {
        nom: 'Caftan Rose Poudre',
        type: 'caftan',
        description:
          "Caftan delicat en mousseline rose poudre avec des applications florales en dentelle. Romantique et feminin, parfait pour les fiancailles.",
        prix: 1100,
        tailles: ['XS', 'S', 'M'],
        couleurs: ['Rose poudre', 'Ivoire'],
        images: [img.caftan_rose_1, img.caftan_rose_2],
        boutique: boutique1._id,
        disponible: true,
      },
      {
        nom: 'Caftan Bordeaux Imperial',
        type: 'caftan',
        description:
          "Caftan majestueux en velours bordeaux avec des broderies en fil de soie. Travail artisanal d'exception inspire des tenues royales marocaines.",
        prix: 2000,
        tailles: ['S', 'M', 'L', 'XL', 'XXL'],
        couleurs: ['Bordeaux', 'Dore'],
        images: [img.caftan_bordeaux_1, img.caftan_bordeaux_2],
        boutique: boutique1._id,
        disponible: false,
      },

      // Boutique 2 - Marrakech Prestige (5 tenues)
      {
        nom: 'Takchita Princesse Doree',
        type: 'takchita',
        description:
          "Takchita deux pieces en brocart dore. La premiere piece (tahtia) en satin ivoire et la deuxieme (dfina) richement brodee. Ensemble complet avec mdamma et bijoux.",
        prix: 2500,
        tailles: ['S', 'M', 'L'],
        couleurs: ['Dore', 'Ivoire'],
        images: [img.takchita_doree_1, img.takchita_doree_2],
        boutique: boutique2._id,
        disponible: true,
      },
      {
        nom: 'Takchita Blanche Mariee',
        type: 'takchita',
        description:
          "Takchita de mariee en blanc immacule avec des cristaux Swarovski et perles de culture. Le choix ideal pour le jour J. Voile assorti disponible.",
        prix: 3500,
        tailles: ['XS', 'S', 'M', 'L', 'XL'],
        couleurs: ['Blanc', 'Cristal'],
        images: [img.takchita_blanche_1, img.takchita_blanche_2],
        boutique: boutique2._id,
        disponible: true,
      },
      {
        nom: 'Robe de Soiree Sahara',
        type: 'robe de soiree',
        description:
          "Robe de soiree longue couleur sable avec des details en sequins dores. Coupe sirene mettant en valeur la silhouette. Elegance orientale moderne.",
        prix: 900,
        tailles: ['S', 'M', 'L'],
        couleurs: ['Sable', 'Dore'],
        images: [img.robe_sahara_1, img.robe_sahara_2],
        boutique: boutique2._id,
        disponible: true,
      },
      {
        nom: 'Takchita Turquoise Atlas',
        type: 'takchita',
        description:
          "Takchita en soie turquoise ornee de motifs geometriques amazigh. Fusion parfaite entre heritage berbere et elegance contemporaine.",
        prix: 2200,
        tailles: ['M', 'L', 'XL'],
        couleurs: ['Turquoise', 'Argente'],
        images: [img.takchita_turquoise_1, img.takchita_turquoise_2],
        boutique: boutique2._id,
        disponible: true,
      },
      {
        nom: 'Robe de Soiree Nuit Etoilee',
        type: 'robe de soiree',
        description:
          "Robe de soiree bleu nuit parsemee de cristaux brillants comme un ciel etoile. Tissu fluide et tombant pour un effet spectaculaire.",
        prix: 1300,
        tailles: ['XS', 'S', 'M', 'L'],
        couleurs: ['Bleu nuit', 'Argente'],
        images: [img.robe_nuit_1, img.robe_nuit_2],
        boutique: boutique2._id,
        disponible: true,
      },

      // Boutique 3 - Fes Haute Couture (5 tenues)
      {
        nom: 'Caftan Fassi Traditionnel',
        type: 'caftan',
        description:
          "Caftan authentique fassi en brocart tisse a la main. Broderies terz en fil de soie, coupe traditionnelle revisitee. Un hommage au patrimoine de Fes.",
        prix: 2800,
        tailles: ['S', 'M', 'L', 'XL'],
        couleurs: ['Pourpre', 'Dore'],
        images: [img.caftan_fassi_1, img.caftan_fassi_2],
        boutique: boutique3._id,
        disponible: true,
      },
      {
        nom: 'Takchita Zellige',
        type: 'takchita',
        description:
          "Takchita inspiree des motifs du zellige fassi. Broderies geometriques complexes sur satin duchesse. Un chef-d'oeuvre d'artisanat marocain.",
        prix: 3000,
        tailles: ['S', 'M', 'L'],
        couleurs: ['Vert sapin', 'Dore'],
        images: [img.takchita_zellige_1, img.takchita_zellige_2],
        boutique: boutique3._id,
        disponible: true,
      },
      {
        nom: 'Robe de Soiree Andalouse',
        type: 'robe de soiree',
        description:
          "Robe de soiree rouge passion inspiree de l'heritage andalou de Fes. Dentelle et velours pour un look dramatique et envoûtant.",
        prix: 1100,
        tailles: ['XS', 'S', 'M', 'L', 'XL'],
        couleurs: ['Rouge', 'Noir'],
        images: [img.robe_andalouse_1, img.robe_andalouse_2],
        boutique: boutique3._id,
        disponible: true,
      },
      {
        nom: 'Caftan Perle du Rif',
        type: 'caftan',
        description:
          "Caftan en organza blanc perle avec des broderies en relief et applications de perles naturelles. Leger et gracieux, ideal pour les ceremonies d'ete.",
        prix: 1600,
        tailles: ['S', 'M', 'L'],
        couleurs: ['Blanc perle', 'Argente'],
        images: [img.caftan_perle_1, img.caftan_perle_2],
        boutique: boutique3._id,
        disponible: true,
      },
      {
        nom: 'Takchita Ambre et Cannelle',
        type: 'takchita',
        description:
          "Takchita chaleureuse en tons ambre et cannelle. Tissus nobles et broderies traditionnelles rbtia. Parfaite pour les soirees d'automne et d'hiver.",
        prix: 2400,
        tailles: ['M', 'L', 'XL', 'XXL'],
        couleurs: ['Ambre', 'Cannelle'],
        images: [img.takchita_ambre_1, img.takchita_ambre_2],
        boutique: boutique3._id,
        disponible: true,
      },
    ]);

    console.log(`${tenues.length} tenues creees`);

    // --- RESERVATIONS (quelques exemples) ---
    await Reservation.create([
      {
        client: client1._id,
        tenue: tenues[0]._id,
        dateDebut: new Date('2026-03-15'),
        dateFin: new Date('2026-03-17'),
        statut: 'confirmee',
        taille: 'M',
        couleur: 'Vert emeraude',
        prixTotal: 1500,
      },
      {
        client: client2._id,
        tenue: tenues[5]._id,
        dateDebut: new Date('2026-03-20'),
        dateFin: new Date('2026-03-22'),
        statut: 'en_attente',
        taille: 'S',
        couleur: 'Dore',
        prixTotal: 2500,
      },
      {
        client: client1._id,
        tenue: tenues[10]._id,
        dateDebut: new Date('2026-04-01'),
        dateFin: new Date('2026-04-03'),
        statut: 'confirmee',
        taille: 'L',
        couleur: 'Vert sapin',
        prixTotal: 2800,
      },
    ]);

    console.log('3 reservations creees');

    // --- SUMMARY ---
    console.log('\n========== SEED TERMINE ==========');
    console.log('Comptes de test :');
    console.log('  Admin    : admin@dressByAmeksa.com / admin123');
    console.log('  Vendeur 1: fatima@boutique.com / vendeur123');
    console.log('  Vendeur 2: khadija@boutique.com / vendeur123');
    console.log('  Vendeur 3: naima@boutique.com / vendeur123');
    console.log('  Client 1 : sara@client.com / client123');
    console.log('  Client 2 : amina@client.com / client123');
    console.log('===================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Erreur seed:', error.message || error);
    console.error(error.stack || error);
    process.exit(1);
  }
};

seedData();
