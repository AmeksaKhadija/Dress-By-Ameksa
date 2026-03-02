const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Boutique = require('./models/Boutique');
const Tenue = require('./models/Tenue');
const Reservation = require('./models/Reservation');

dotenv.config();

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
      logo: {
        url: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=200&h=200&fit=crop',
        public_id: 'seed/logo_dar_al_caftan',
      },
      adresse: 'Derb Omar, Casablanca',
      vendeur: vendeur1._id,
      statut: 'validee',
    });

    const boutique2 = await Boutique.create({
      nom: 'Marrakech Prestige',
      description:
        "Situee au coeur de Marrakech, notre boutique propose une collection exclusive de takchitas et robes de soiree. Chaque piece est confectionnee avec les meilleurs tissus et ornee de broderies fait main d'exception.",
      logo: {
        url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200&h=200&fit=crop',
        public_id: 'seed/logo_marrakech_prestige',
      },
      adresse: 'Gueliz, Marrakech',
      vendeur: vendeur2._id,
      statut: 'validee',
    });

    const boutique3 = await Boutique.create({
      nom: 'Fes Haute Couture',
      description:
        'Heritiere du savoir-faire fassi, notre maison cree des tenues qui celebrent la richesse de la tradition marocaine. Specialistes du brocart et du sfifa, nous habillons les mariees et les invitees depuis 20 ans.',
      logo: {
        url: 'https://images.unsplash.com/photo-1528698827591-e19cef51a699?w=200&h=200&fit=crop',
        public_id: 'seed/logo_fes_haute_couture',
      },
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
        images: [
          { url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&h=800&fit=crop', public_id: 'seed/caftan_royal_1' },
          { url: 'https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=600&h=800&fit=crop', public_id: 'seed/caftan_royal_2' },
        ],
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
        images: [
          { url: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&h=800&fit=crop', public_id: 'seed/caftan_bleu_1' },
          { url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&h=800&fit=crop', public_id: 'seed/caftan_bleu_2' },
        ],
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
        images: [
          { url: 'https://images.unsplash.com/photo-1596783074918-c84cb06531ca?w=600&h=800&fit=crop', public_id: 'seed/caftan_noir_1' },
          { url: 'https://images.unsplash.com/photo-1562572159-4efc207f5aff?w=600&h=800&fit=crop', public_id: 'seed/caftan_noir_2' },
        ],
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
        images: [
          { url: 'https://images.unsplash.com/photo-1594463750939-ebb28c3f7f75?w=600&h=800&fit=crop', public_id: 'seed/caftan_rose_1' },
          { url: 'https://images.unsplash.com/photo-1518622358385-8ea7d0794bf6?w=600&h=800&fit=crop', public_id: 'seed/caftan_rose_2' },
        ],
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
        images: [
          { url: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600&h=800&fit=crop', public_id: 'seed/caftan_bordeaux_1' },
          { url: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&h=800&fit=crop', public_id: 'seed/caftan_bordeaux_2' },
        ],
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
        images: [
          { url: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=600&h=800&fit=crop', public_id: 'seed/takchita_doree_1' },
          { url: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&h=800&fit=crop', public_id: 'seed/takchita_doree_2' },
        ],
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
        images: [
          { url: 'https://images.unsplash.com/photo-1594552072238-b8a33785b261?w=600&h=800&fit=crop', public_id: 'seed/takchita_blanche_1' },
          { url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&h=800&fit=crop', public_id: 'seed/takchita_blanche_2' },
        ],
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
        images: [
          { url: 'https://images.unsplash.com/photo-1518622358385-8ea7d0794bf6?w=600&h=800&fit=crop', public_id: 'seed/robe_sahara_1' },
          { url: 'https://images.unsplash.com/photo-1568252542512-9fe8fe9c87bb?w=600&h=800&fit=crop', public_id: 'seed/robe_sahara_2' },
        ],
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
        images: [
          { url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&h=800&fit=crop', public_id: 'seed/takchita_turquoise_1' },
          { url: 'https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=600&h=800&fit=crop', public_id: 'seed/takchita_turquoise_2' },
        ],
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
        images: [
          { url: 'https://images.unsplash.com/photo-1562572159-4efc207f5aff?w=600&h=800&fit=crop', public_id: 'seed/robe_nuit_1' },
          { url: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=600&h=800&fit=crop', public_id: 'seed/robe_nuit_2' },
        ],
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
        images: [
          { url: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600&h=800&fit=crop', public_id: 'seed/caftan_fassi_1' },
          { url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&h=800&fit=crop', public_id: 'seed/caftan_fassi_2' },
        ],
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
        images: [
          { url: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&h=800&fit=crop', public_id: 'seed/takchita_zellige_1' },
          { url: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&h=800&fit=crop', public_id: 'seed/takchita_zellige_2' },
        ],
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
        images: [
          { url: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&h=800&fit=crop', public_id: 'seed/robe_andalouse_1' },
          { url: 'https://images.unsplash.com/photo-1596783074918-c84cb06531ca?w=600&h=800&fit=crop', public_id: 'seed/robe_andalouse_2' },
        ],
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
        images: [
          { url: 'https://images.unsplash.com/photo-1594552072238-b8a33785b261?w=600&h=800&fit=crop', public_id: 'seed/caftan_perle_1' },
          { url: 'https://images.unsplash.com/photo-1594463750939-ebb28c3f7f75?w=600&h=800&fit=crop', public_id: 'seed/caftan_perle_2' },
        ],
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
        images: [
          { url: 'https://images.unsplash.com/photo-1568252542512-9fe8fe9c87bb?w=600&h=800&fit=crop', public_id: 'seed/takchita_ambre_1' },
          { url: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=600&h=800&fit=crop', public_id: 'seed/takchita_ambre_2' },
        ],
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
        prixTotal: 1500,
      },
      {
        client: client2._id,
        tenue: tenues[5]._id,
        dateDebut: new Date('2026-03-20'),
        dateFin: new Date('2026-03-22'),
        statut: 'en_attente',
        prixTotal: 2500,
      },
      {
        client: client1._id,
        tenue: tenues[10]._id,
        dateDebut: new Date('2026-04-01'),
        dateFin: new Date('2026-04-03'),
        statut: 'confirmee',
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
    console.error('Erreur seed:', error.message);
    process.exit(1);
  }
};

seedData();
