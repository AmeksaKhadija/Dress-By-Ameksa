const formatDate = (date) => new Date(date).toLocaleDateString('fr-FR');

const baseTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; background: #f9fafb; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
    .header { background: linear-gradient(135deg, #be185d, #9d174d); padding: 30px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 24px; }
    .content { padding: 30px; }
    .content h2 { color: #1f2937; font-size: 20px; margin-top: 0; }
    .content p { color: #4b5563; line-height: 1.6; }
    .info-box { background: #f3f4f6; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
    .info-row:last-child { border-bottom: none; }
    .info-label { color: #6b7280; font-size: 14px; }
    .info-value { color: #1f2937; font-weight: 600; font-size: 14px; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: 600; }
    .badge-green { background: #d1fae5; color: #065f46; }
    .badge-red { background: #fee2e2; color: #991b1b; }
    .badge-blue { background: #dbeafe; color: #1e40af; }
    .badge-yellow { background: #fef3c7; color: #92400e; }
    .footer { padding: 20px 30px; text-align: center; background: #f9fafb; border-top: 1px solid #e5e7eb; }
    .footer p { color: #9ca3af; font-size: 12px; margin: 4px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Dress by Ameksa</h1>
    </div>
    ${content}
    <div class="footer">
      <p>Dress by Ameksa - Location de tenues traditionnelles</p>
      <p>Cet email a ete envoye automatiquement, merci de ne pas repondre.</p>
    </div>
  </div>
</body>
</html>
`;

exports.reservationStatusTemplate = ({ clientNom, tenueNom, statut }) => {
  const isConfirmed = statut === 'confirmee';
  const badgeClass = isConfirmed ? 'badge-green' : 'badge-red';
  const statusText = isConfirmed ? 'Confirmee' : 'Annulee';
  const message = isConfirmed
    ? 'Votre reservation a ete acceptee par le vendeur.'
    : 'Votre reservation a malheureusement ete refusee par le vendeur.';

  return baseTemplate(`
    <div class="content">
      <h2>Bonjour ${clientNom},</h2>
      <p>${message}</p>
      <div class="info-box">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="padding:8px 0;color:#6b7280;font-size:14px">Tenue</td><td style="padding:8px 0;color:#1f2937;font-weight:600;font-size:14px;text-align:right">${tenueNom}</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280;font-size:14px">Statut</td><td style="padding:8px 0;text-align:right"><span class="badge ${badgeClass}">${statusText}</span></td></tr>
        </table>
      </div>
      ${isConfirmed ? '<p>Vous pouvez consulter les details de votre reservation depuis votre espace client.</p>' : '<p>N\'hesitez pas a parcourir notre catalogue pour trouver d\'autres tenues.</p>'}
    </div>
  `);
};

exports.paiementConfirmationTemplate = ({ clientNom, montant, reservationId, datePaiement }) => {
  return baseTemplate(`
    <div class="content">
      <h2>Bonjour ${clientNom},</h2>
      <p>Votre paiement a ete effectue avec succes.</p>
      <div class="info-box">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="padding:8px 0;color:#6b7280;font-size:14px">Montant</td><td style="padding:8px 0;color:#1f2937;font-weight:600;font-size:14px;text-align:right">${montant} MAD</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280;font-size:14px">Reference</td><td style="padding:8px 0;color:#1f2937;font-weight:600;font-size:14px;text-align:right">${reservationId}</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280;font-size:14px">Date</td><td style="padding:8px 0;color:#1f2937;font-weight:600;font-size:14px;text-align:right">${formatDate(datePaiement)}</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280;font-size:14px">Statut</td><td style="padding:8px 0;text-align:right"><span class="badge badge-green">Paye</span></td></tr>
        </table>
      </div>
      <p>Votre reservation est maintenant confirmee. Consultez votre espace client pour les details.</p>
    </div>
  `);
};

exports.reservationConfirmationTemplate = ({ clientNom, tenueNom, dateDebut, dateFin, prixTotal }) => {
  return baseTemplate(`
    <div class="content">
      <h2>Bonjour ${clientNom},</h2>
      <p>Votre demande de reservation a bien ete enregistree.</p>
      <div class="info-box">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="padding:8px 0;color:#6b7280;font-size:14px">Tenue</td><td style="padding:8px 0;color:#1f2937;font-weight:600;font-size:14px;text-align:right">${tenueNom}</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280;font-size:14px">Du</td><td style="padding:8px 0;color:#1f2937;font-weight:600;font-size:14px;text-align:right">${formatDate(dateDebut)}</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280;font-size:14px">Au</td><td style="padding:8px 0;color:#1f2937;font-weight:600;font-size:14px;text-align:right">${formatDate(dateFin)}</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280;font-size:14px">Prix total</td><td style="padding:8px 0;color:#1f2937;font-weight:600;font-size:14px;text-align:right">${prixTotal} MAD</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280;font-size:14px">Statut</td><td style="padding:8px 0;text-align:right"><span class="badge badge-yellow">En attente</span></td></tr>
        </table>
      </div>
      <p>Le vendeur va examiner votre demande. Vous recevrez un email des que le statut sera mis a jour.</p>
    </div>
  `);
};
