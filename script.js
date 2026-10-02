/* ============================================================
   FAST DEVIS — Script principal
   Organisation :
   1. Configuration
   2. État du devis
   3. Références DOM
   4. Gestion du stockage local
   5. Gestion du logo
   6. Gestion de l'entreprise
   7. Gestion du client
   8. Gestion du document
   9. Gestion des prestations
   10. Calculs
   11. Rendu du tableau
   12. Rendu de l'aperçu
   13. Impression
   14. Gestion des événements
   15. Initialisation
   ============================================================ */

'use strict';

/* ============ 1. CONFIGURATION ============ */

const CONFIG = {
  cleStockage: 'fast-devis-donnees',
  cleParametres: 'fast-devis-parametres',
  symbolesDevise: {
    EUR: '€',
    USD: '$',
    GBP: '£',
    CHF: 'CHF',
    CAD: 'C$'
  },
  positionsDevise: {
    EUR: 'apres',
    USD: 'avant',
    GBP: 'avant',
    CHF: 'apres',
    CAD: 'avant'
  },
  langueFormat: 'fr-FR'
};

/* ============ 2. ÉTAT DU DEVIS ============ */

const devis = {
  entreprise: {
    nom: '',
    adresse: '',
    telephone: '',
    email: '',
    site: '',
    legal: '',
    logo: ''
  },
  client: {
    nom: '',
    adresse: '',
    telephone: '',
    email: ''
  },
  document: {
    numero: '',
    date: '',
    objet: '',
    devise: 'EUR'
  },
  prestations: [],
  apparence: {
    positionLogo: 'gauche'
  }
};

const parametres = {
  deviseDefaut: 'EUR',
  prefixeNumero: 'DEV',
  theme: 'light'
};

/* ============ 3. RÉFÉRENCES DOM ============ */

const references = {
  // Barre actions
  actionNouveau: document.getElementById('action-nouveau'),
  actionEnregistrer: document.getElementById('action-enregistrer'),
  actionImprimer: document.getElementById('action-imprimer'),
  actionTelecharger: document.getElementById('action-telecharger'),
  actionParametres: document.getElementById('action-parametres'),

  // Entreprise
  entrepriseNom: document.getElementById('entreprise-nom'),
  entrepriseAdresse: document.getElementById('entreprise-adresse'),
  entrepriseTelephone: document.getElementById('entreprise-telephone'),
  entrepriseEmail: document.getElementById('entreprise-email'),
  entrepriseSite: document.getElementById('entreprise-site'),
  entrepriseLegal: document.getElementById('entreprise-legal'),

  // Logo
  inputTeleverserLogo: document.getElementById('input-televerser-logo'),
  apercuLogoEntreprise: document.getElementById('apercu-logo-entreprise'),
  imgLogoEntreprise: document.getElementById('img-logo-entreprise'),
  boutonSupprimerLogo: document.getElementById('bouton-supprimer-logo'),
  controlePositionLogo: document.getElementById('controle-position-logo'),
  boutonsPosition: document.querySelectorAll('.bouton-position'),
  boutonsPositionApp: document.querySelectorAll('.bouton-position-app'),

  // Document
  documentNumero: document.getElementById('document-numero'),
  documentDate: document.getElementById('document-date'),
  documentObjet: document.getElementById('document-objet'),
  documentMainOeuvre: document.getElementById('document-main-oeuvre'),

  // Client
  clientNom: document.getElementById('client-nom'),
  clientAdresse: document.getElementById('client-adresse'),
  clientTelephone: document.getElementById('client-telephone'),
  clientEmail: document.getElementById('client-email'),

  // Prestations
  corpsTableauPrestations: document.getElementById('corps-tableau-prestations'),
  cartesPrestations: document.getElementById('cartes-prestations'),
  boutonAjouterPrestation: document.getElementById('bouton-ajouter-prestation'),

  // Apparence
  apparenceDevise: document.getElementById('apparence-devise'),

  // Aperçu
  feuilleDevis: document.getElementById('feuille-devis'),

  // Panneau paramètres
  panneauParametres: document.getElementById('panneau-parametres'),
  boutonFermerParametres: document.getElementById('bouton-fermer-parametres'),
  overlayPanneau: document.getElementById('overlay-panneau'),
  parametreDevise: document.getElementById('parametre-devise'),
  parametrePrefixeNumero: document.getElementById('parametre-prefixe-numero'),
  boutonsTheme: document.querySelectorAll('.bouton-theme'),
  boutonEffacerDonnees: document.getElementById('bouton-effacer-donnees'),

  // Message statut
  messageStatut: document.getElementById('message-statut'),

  // Bascule mobile
  basculeMobile: document.querySelector('.bascule-mobile'),
  boutonsBascule: document.querySelectorAll('.bouton-bascule'),
  espaceEdition: document.getElementById('espace-edition'),
  espaceApercus: document.getElementById('espace-apercu')
};

/* ============ 4. GESTION DU STOCKAGE LOCAL ============ */

function chargerDonnees() {
  try {
    const donnees = localStorage.getItem(CONFIG.cleStockage);
    if (donnees) {
      const parsed = JSON.parse(donnees);
      if (parsed.entreprise) Object.assign(devis.entreprise, parsed.entreprise);
      if (parsed.client) Object.assign(devis.client, parsed.client);
      if (parsed.document) Object.assign(devis.document, parsed.document);
      if (Array.isArray(parsed.prestations)) devis.prestations = parsed.prestations;
      if (parsed.apparence) Object.assign(devis.apparence, parsed.apparence);
    }
  } catch (e) {
    // Ignorer les erreurs de lecture
  }

  try {
    const params = localStorage.getItem(CONFIG.cleParametres);
    if (params) {
      const parsed = JSON.parse(params);
      Object.assign(parametres, parsed);
    }
  } catch (e) {
    // Ignorer
  }
}

function enregistrerDonnees() {
  try {
    localStorage.setItem(CONFIG.cleStockage, JSON.stringify(devis));
    afficherMessage('Devis enregistré');
  } catch (e) {
    afficherMessage('Erreur lors de l\'enregistrement', 'erreur');
  }
}

function enregistrerParametres() {
  try {
    localStorage.setItem(CONFIG.cleParametres, JSON.stringify(parametres));
  } catch (e) {
    // Ignorer
  }
}

function effacerDonnees() {
  localStorage.removeItem(CONFIG.cleStockage);
  localStorage.removeItem(CONFIG.cleParametres);
}

/* ============ 5. GESTION DU LOGO ============ */

function televerserLogo(fichier) {
  if (!fichier || !fichier.type.startsWith('image/')) {
    afficherMessage('Veuillez sélectionner une image', 'erreur');
    return;
  }
  const lecteur = new FileReader();
  lecteur.onload = function (e) {
    devis.entreprise.logo = e.target.result;
    mettreAJourApercuLogo();
    mettreAJourApercu();
    enregistrerDonnees();
  };
  lecteur.readAsDataURL(fichier);
}

function supprimerLogo() {
  devis.entreprise.logo = '';
  mettreAJourApercuLogo();
  mettreAJourApercu();
  enregistrerDonnees();
}

function mettreAJourApercuLogo() {
  if (devis.entreprise.logo) {
    references.imgLogoEntreprise.src = devis.entreprise.logo;
    references.apercuLogoEntreprise.hidden = false;
    references.controlePositionLogo.hidden = false;
  } else {
    references.apercuLogoEntreprise.hidden = true;
    references.controlePositionLogo.hidden = true;
  }
}

function changerPositionLogo(position) {
  devis.apparence.positionLogo = position;
  mettreAJourBoutonsPosition();
  mettreAJourApercu();
  enregistrerDonnees();
}

function mettreAJourBoutonsPosition() {
  references.boutonsPosition.forEach(function (btn) {
    btn.classList.toggle('actif', btn.dataset.position === devis.apparence.positionLogo);
  });
  references.boutonsPositionApp.forEach(function (btn) {
    btn.classList.toggle('actif', btn.dataset.position === devis.apparence.positionLogo);
  });
}

/* ============ 6. GESTION DE L'ENTREPRISE ============ */

function lierChampsEntreprise() {
  references.entrepriseNom.addEventListener('input', function (e) {
    devis.entreprise.nom = e.target.value;
    mettreAJourApercu();
    planifierEnregistrement();
  });
  references.entrepriseAdresse.addEventListener('input', function (e) {
    devis.entreprise.adresse = e.target.value;
    mettreAJourApercu();
    planifierEnregistrement();
  });
  references.entrepriseTelephone.addEventListener('input', function (e) {
    devis.entreprise.telephone = e.target.value;
    mettreAJourApercu();
    planifierEnregistrement();
  });
  references.entrepriseEmail.addEventListener('input', function (e) {
    devis.entreprise.email = e.target.value;
    mettreAJourApercu();
    planifierEnregistrement();
  });
  references.entrepriseSite.addEventListener('input', function (e) {
    devis.entreprise.site = e.target.value;
    mettreAJourApercu();
    planifierEnregistrement();
  });
  references.entrepriseLegal.addEventListener('input', function (e) {
    devis.entreprise.legal = e.target.value;
    mettreAJourApercu();
    planifierEnregistrement();
  });
}

function remplirChampsEntreprise() {
  references.entrepriseNom.value = devis.entreprise.nom;
  references.entrepriseAdresse.value = devis.entreprise.adresse;
  references.entrepriseTelephone.value = devis.entreprise.telephone;
  references.entrepriseEmail.value = devis.entreprise.email;
  references.entrepriseSite.value = devis.entreprise.site;
  references.entrepriseLegal.value = devis.entreprise.legal;
}

/* ============ 7. GESTION DU CLIENT ============ */

function lierChampsClient() {
  references.clientNom.addEventListener('input', function (e) {
    devis.client.nom = e.target.value;
    mettreAJourApercu();
    planifierEnregistrement();
  });
  references.clientAdresse.addEventListener('input', function (e) {
    devis.client.adresse = e.target.value;
    mettreAJourApercu();
    planifierEnregistrement();
  });
  references.clientTelephone.addEventListener('input', function (e) {
    devis.client.telephone = e.target.value;
    mettreAJourApercu();
    planifierEnregistrement();
  });
  references.clientEmail.addEventListener('input', function (e) {
    devis.client.email = e.target.value;
    mettreAJourApercu();
    planifierEnregistrement();
  });
}

function remplirChampsClient() {
  references.clientNom.value = devis.client.nom;
  references.clientAdresse.value = devis.client.adresse;
  references.clientTelephone.value = devis.client.telephone;
  references.clientEmail.value = devis.client.email;
}

/* ============ 8. GESTION DU DOCUMENT ============ */

function lierChampsDocument() {
  references.documentNumero.addEventListener('input', function (e) {
    devis.document.numero = e.target.value;
    mettreAJourApercu();
    planifierEnregistrement();
  });
  references.documentDate.addEventListener('input', function (e) {
    devis.document.date = e.target.value;
    mettreAJourApercu();
    planifierEnregistrement();
  });
  references.documentObjet.addEventListener('input', function (e) {
    devis.document.objet = e.target.value;
    mettreAJourApercu();
    planifierEnregistrement();
  });
  references.documentMainOeuvre.addEventListener('input', function (e) {
    devis.document.mainOeuvre = Math.max(0, parseFloat(e.target.value) || 0);
    mettreAJourApercu();
    planifierEnregistrement();
  });
  references.apparenceDevise.addEventListener('change', function (e) {
    devis.document.devise = e.target.value;
    mettreAJourApercu();
    planifierEnregistrement();
  });
}

function remplirChampsDocument() {
  references.documentNumero.value = devis.document.numero;
  references.documentDate.value = devis.document.date;
  references.documentObjet.value = devis.document.objet;
  references.documentMainOeuvre.value = devis.document.mainOeuvre || '';
  references.apparenceDevise.value = devis.document.devise;
}

function genererNumeroDevis() {
  var annee = new Date().getFullYear();
  var compteur = 1;
  try {
    var stock = localStorage.getItem('fast-devis-compteur-' + annee);
    if (stock) compteur = parseInt(stock, 10) + 1;
  } catch (e) {
    // Ignorer
  }
  try {
    localStorage.setItem('fast-devis-compteur-' + annee, String(compteur));
  } catch (e) {
    // Ignorer
  }
  var prefixe = parametres.prefixeNumero || 'DEV';
  return prefixe + '-' + annee + '-' + String(compteur).padStart(3, '0');
}

function genererDateAujourdhui() {
  var maintenant = new Date();
  var annee = maintenant.getFullYear();
  var mois = String(maintenant.getMonth() + 1).padStart(2, '0');
  var jour = String(maintenant.getDate()).padStart(2, '0');
  return annee + '-' + mois + '-' + jour;
}

function formaterDate(dateStr) {
  if (!dateStr) return '';
  var parties = dateStr.split('-');
  if (parties.length !== 3) return dateStr;
  return parties[2] + '/' + parties[1] + '/' + parties[0];
}

/* ============ 9. GESTION DES PRESTATIONS ============ */

function creerPrestation() {
  return {
    id: Date.now() + Math.random(),
    designation: '',
    quantite: 1,
    prixUnitaire: 0
  };
}

function ajouterPrestation() {
  var prestation = creerPrestation();
  devis.prestations.push(prestation);
  rendreTableauPrestations();
  rendreCartesPrestations();
  mettreAJourApercu();
  planifierEnregistrement();
  // Focus sur la dernière ligne ajoutée
  setTimeout(function () {
    var dernieres = references.corpsTableauPrestations.querySelectorAll('input[data-champ="designation"]');
    if (dernieres.length) dernieres[dernieres.length - 1].focus();
  }, 0);
}

function supprimerPrestation(id) {
  devis.prestations = devis.prestations.filter(function (p) {
    return p.id !== id;
  });
  rendreTableauPrestations();
  rendreCartesPrestations();
  mettreAJourApercu();
  planifierEnregistrement();
}

function dupliquerPrestation(id) {
  var index = devis.prestations.findIndex(function (p) { return p.id === id; });
  if (index === -1) return;
  var copie = Object.assign({}, devis.prestations[index]);
  copie.id = Date.now() + Math.random();
  devis.prestations.splice(index + 1, 0, copie);
  rendreTableauPrestations();
  rendreCartesPrestations();
  mettreAJourApercu();
  planifierEnregistrement();
}

function modifierPrestation(id, champ, valeur) {
  var prestation = devis.prestations.find(function (p) { return p.id === id; });
  if (!prestation) return;
  if (champ === 'designation') {
    prestation.designation = valeur;
  } else if (champ === 'quantite') {
    prestation.quantite = parseFloat(valeur) || 0;
  } else if (champ === 'prixUnitaire') {
    prestation.prixUnitaire = parseFloat(valeur) || 0;
  }
  mettreAJourMontantsTableau();
  mettreAJourApercu();
  planifierEnregistrement();
}

/* ============ 10. CALCULS ============ */

function calculerMontant(prestation) {
  return (prestation.quantite || 0) * (prestation.prixUnitaire || 0);
}

function calculerTotal() {
  var totalPrestations = devis.prestations.reduce(function (total, p) {
    return total + calculerMontant(p);
  }, 0);
  return totalPrestations + (parseFloat(devis.document.mainOeuvre) || 0);
}

function formaterMontant(valeur) {
  var nombre = parseFloat(valeur) || 0;
  var formate = nombre.toLocaleString(CONFIG.langueFormat, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  return formate;
}

function formaterDevise(valeur) {
  var symbole = CONFIG.symbolesDevise[devis.document.devise] || '€';
  var position = CONFIG.positionsDevise[devis.document.devise] || 'apres';
  var montant = formaterMontant(valeur);
  if (position === 'avant') {
    return symbole + montant;
  }
  return montant + ' ' + symbole;
}

/* ============ 11. RENDU DU TABLEAU ============ */

function rendreTableauPrestations() {
  var tbody = references.corpsTableauPrestations;
  tbody.innerHTML = '';

  if (devis.prestations.length === 0) {
    var tr = document.createElement('tr');
    tr.className = 'ligne-vide';
    tr.innerHTML = '<td colspan="5">Aucune prestation. Cliquez sur « Ajouter une prestation » pour commencer.</td>';
    tbody.appendChild(tr);
    return;
  }

  devis.prestations.forEach(function (prestation) {
    var tr = document.createElement('tr');
    tr.dataset.id = prestation.id;

    tr.innerHTML =
      '<td class="col-designation">' +
        '<input type="text" data-champ="designation" value="' + echapperHtml(prestation.designation) + '" placeholder="Désignation de la prestation" aria-label="Désignation" />' +
      '</td>' +
      '<td class="col-quantite">' +
        '<input type="number" data-champ="quantite" value="' + (prestation.quantite || '') + '" min="0" step="any" aria-label="Quantité" />' +
      '</td>' +
      '<td class="col-prix">' +
        '<input type="number" data-champ="prixUnitaire" value="' + (prestation.prixUnitaire || '') + '" min="0" step="any" aria-label="Prix unitaire" />' +
      '</td>' +
      '<td class="col-montant montant-cellule">' + formaterDevise(calculerMontant(prestation)) + '</td>' +
      '<td class="col-actions">' +
        '<button type="button" class="bouton-ligne bouton-dupliquer-ligne" aria-label="Dupliquer la ligne" title="Dupliquer">' +
          '<img src="/assets/dupliquer.svg" alt="" class="icone" />' +
        '</button>' +
        '<button type="button" class="bouton-ligne bouton-supprimer-ligne" aria-label="Supprimer la ligne" title="Supprimer">' +
          '<img src="/assets/supprimer.svg" alt="" class="icone" />' +
        '</button>' +
      '</td>';

    // Événements
    var inputs = tr.querySelectorAll('input');
    inputs.forEach(function (input) {
      input.addEventListener('input', function (e) {
        modifierPrestation(prestation.id, e.target.dataset.champ, e.target.value);
      });
    });

    tr.querySelector('.bouton-dupliquer-ligne').addEventListener('click', function () {
      dupliquerPrestation(prestation.id);
    });
    tr.querySelector('.bouton-supprimer-ligne').addEventListener('click', function () {
      supprimerPrestation(prestation.id);
    });

    tbody.appendChild(tr);
  });
}

function mettreAJourMontantsTableau() {
  var lignes = references.corpsTableauPrestations.querySelectorAll('tr[data-id]');
  lignes.forEach(function (tr) {
    var id = parseFloat(tr.dataset.id);
    var prestation = devis.prestations.find(function (p) { return p.id === id; });
    if (prestation) {
      var cellule = tr.querySelector('.montant-cellule');
      if (cellule) cellule.textContent = formaterDevise(calculerMontant(prestation));
    }
  });
}

function rendreCartesPrestations() {
  var conteneur = references.cartesPrestations;
  conteneur.innerHTML = '';

  if (devis.prestations.length === 0) {
    var div = document.createElement('div');
    div.className = 'carte-prestation';
    div.style.textAlign = 'center';
    div.style.color = 'var(--couleur-texte-inactif)';
    div.style.fontStyle = 'italic';
    div.style.padding = 'var(--espace-grand)';
    div.textContent = 'Aucune prestation. Touchez « Ajouter une prestation » pour commencer.';
    conteneur.appendChild(div);
    return;
  }

  devis.prestations.forEach(function (prestation) {
    var carte = document.createElement('div');
    carte.className = 'carte-prestation';
    carte.dataset.id = prestation.id;

    carte.innerHTML =
      '<input type="text" data-champ="designation" value="' + echapperHtml(prestation.designation) + '" placeholder="Désignation" class="designation-carte" aria-label="Désignation" />' +
      '<div class="ligne-carte">' +
        '<span class="label-carte">Quantité</span>' +
        '<input type="number" data-champ="quantite" value="' + (prestation.quantite || '') + '" min="0" step="any" aria-label="Quantité" />' +
      '</div>' +
      '<div class="ligne-carte">' +
        '<span class="label-carte">Prix unitaire</span>' +
        '<input type="number" data-champ="prixUnitaire" value="' + (prestation.prixUnitaire || '') + '" min="0" step="any" aria-label="Prix unitaire" />' +
      '</div>' +
      '<div class="ligne-carte">' +
        '<span class="label-carte">Montant</span>' +
        '<span class="montant-carte">' + formaterDevise(calculerMontant(prestation)) + '</span>' +
      '</div>' +
      '<div class="actions-carte">' +
        '<button type="button" class="bouton-dupliquer-mobile">' +
          '<img src="/assets/dupliquer.svg" alt="" class="icone" /> Dupliquer' +
        '</button>' +
        '<button type="button" class="bouton-supprimer-mobile">' +
          '<img src="/assets/supprimer.svg" alt="" class="icone" /> Supprimer' +
        '</button>' +
      '</div>';

    var inputs = carte.querySelectorAll('input');
    inputs.forEach(function (input) {
      input.addEventListener('input', function (e) {
        modifierPrestation(prestation.id, e.target.dataset.champ, e.target.value);
        // Mettre à jour le montant de la carte
        if (e.target.dataset.champ === 'quantite' || e.target.dataset.champ === 'prixUnitaire') {
          var cellule = carte.querySelector('.montant-carte');
          if (cellule) cellule.textContent = formaterDevise(calculerMontant(prestation));
        }
      });
    });

    carte.querySelector('.bouton-dupliquer-mobile').addEventListener('click', function () {
      dupliquerPrestation(prestation.id);
    });
    carte.querySelector('.bouton-supprimer-mobile').addEventListener('click', function () {
      supprimerPrestation(prestation.id);
    });

    conteneur.appendChild(carte);
  });
}

/* ============ 12. RENDU DE L'APERÇU ============ */

function mettreAJourApercu() {
  var feuille = references.feuilleDevis;
  var positionLogo = devis.apparence.positionLogo || 'gauche';
  var classePosition = positionLogo === 'droite' ? 'droite' : 'gauche';

  var html = '';

  // En-tête
  html += '<div class="devis-entete ' + classePosition + '">';

  // Bloc entreprise
  html += '<div class="entreprise-bloc">';
  html += '<div class="identite-entreprise">';
  if (devis.entreprise.nom) {
    html += '<div class="nom-entreprise">' + echapperHtml(devis.entreprise.nom) + '</div>';
  }
  if (devis.entreprise.logo) {
    html += '<img src="' + devis.entreprise.logo + '" alt="Logo" class="logo-entreprise" />';
  }
  html += '</div>';
  html += '</div>';

  // Bloc titre
  html += '<div class="titre-bloc">';
  html += '<div class="titre-devis">DEVIS</div>';
  if (devis.document.numero) {
    html += '<div class="numero-devis">N° ' + echapperHtml(devis.document.numero) + '</div>';
  }
  if (devis.document.date) {
    html += '<div class="date-devis">Date : ' + formaterDate(devis.document.date) + '</div>';
  }
  html += '</div>';

  html += '</div>';

  // Coordonnées du destinataire
  if (devis.client.nom || devis.client.adresse || devis.client.telephone || devis.client.email) {
    html += '<section class="devis-client">';
    html += '<div class="label-client">Destinataire</div>';
    if (devis.client.nom) {
      html += '<div class="nom-client">' + echapperHtml(devis.client.nom) + '</div>';
    }
    html += '<div class="coordonnees-client">';
    if (devis.client.adresse) html += '<p><span class="libelle-coordonnees">Adresse</span><span>' + echapperHtml(devis.client.adresse) + '</span></p>';
    if (devis.client.telephone) html += '<p><span class="libelle-coordonnees">Téléphone</span><span>' + echapperHtml(devis.client.telephone) + '</span></p>';
    if (devis.client.email) html += '<p><span class="libelle-coordonnees">E-mail</span><span>' + echapperHtml(devis.client.email) + '</span></p>';
    html += '</div>';
    html += '</section>';
  }

  // Objet
  if (devis.document.objet) {
    html += '<div class="devis-objet">';
    html += '<span class="label-objet">Objet :</span>';
    html += '<span class="texte-objet">' + echapperHtml(devis.document.objet) + '</span>';
    html += '</div>';
  }

  // Tableau
  html += '<table class="devis-tableau">';
  html += '<thead>';
  html += '<tr>';
  html += '<th class="col-designation">Désignation</th>';
  html += '<th class="col-quantite">Quantité</th>';
  html += '<th class="col-prix">Prix unitaire</th>';
  html += '<th class="col-montant">Montant</th>';
  html += '</tr>';
  html += '</thead>';
  html += '<tbody>';

  if (devis.prestations.length === 0) {
    html += '<tr class="ligne-vide"><td colspan="4">Aucune prestation</td></tr>';
  } else {
    devis.prestations.forEach(function (p) {
      html += '<tr>';
      html += '<td class="cell-designation">' + echapperHtml(p.designation || '—') + '</td>';
      html += '<td class="cell-quantite">' + (p.quantite || 0) + '</td>';
      html += '<td class="cell-prix">' + formaterDevise(p.prixUnitaire) + '</td>';
      html += '<td class="cell-montant">' + formaterDevise(calculerMontant(p)) + '</td>';
      html += '</tr>';
    });
  }

  html += '</tbody>';
  html += '</table>';

  // Récapitulatif
  html += '<div class="devis-total">';
  html += '<div class="bloc-total">';
  html += '<div class="ligne-sous-total">';
  html += '<span>Sous-total des prestations</span>';
  html += '<span>' + formaterDevise(devis.prestations.reduce(function (total, prestation) {
    return total + calculerMontant(prestation);
  }, 0)) + '</span>';
  html += '</div>';
  if (devis.document.mainOeuvre > 0) {
    html += '<div class="ligne-main-oeuvre">';
    html += '<span>Main-d’œuvre</span>';
    html += '<span>' + formaterDevise(devis.document.mainOeuvre) + '</span>';
    html += '</div>';
  }
  html += '<div class="ligne-total">';
  html += '<span class="label-total">Total général</span>';
  html += '<span class="valeur-total">' + formaterDevise(calculerTotal()) + '</span>';
  html += '</div>';
  html += '</div>';
  html += '</div>';

  // Pied de page
  html += '<div class="devis-pied-page">';
  var elementsPied = [];
  if (devis.entreprise.telephone) elementsPied.push(echapperHtml(devis.entreprise.telephone));
  if (devis.entreprise.email) elementsPied.push(echapperHtml(devis.entreprise.email));
  if (devis.entreprise.adresse) elementsPied.push(echapperHtml(devis.entreprise.adresse));
  if (elementsPied.length) {
    html += '<p class="coordonnees-pied">' + elementsPied.join(' <span class="separateur-pied">—</span> ') + '</p>';
  }
  if (devis.entreprise.site) {
    html += '<p>Site : ' + echapperHtml(devis.entreprise.site) + '</p>';
  }
  if (devis.entreprise.legal) {
    html += '<p>' + echapperHtml(devis.entreprise.legal) + '</p>';
  }
  html += '</div>';

  feuille.innerHTML = html;
}

/* ============ 13. IMPRESSION ============ */

function imprimerDevis() {
  var feuille = references.feuilleDevis;
  var copieMesure = feuille.cloneNode(true);
  var largeurA4 = 170 * 96 / 25.4;
  var hauteurA4 = 267 * 96 / 25.4;
  var echelle = 1;

  copieMesure.style.position = 'fixed';
  copieMesure.style.left = '-10000px';
  copieMesure.style.top = '0';
  copieMesure.style.visibility = 'hidden';
  copieMesure.style.width = largeurA4 + 'px';
  copieMesure.style.maxWidth = 'none';
  copieMesure.style.minHeight = '0';
  copieMesure.style.padding = '0';
  copieMesure.style.margin = '0';
  copieMesure.style.border = '0';
  copieMesure.style.boxShadow = 'none';
  var enteteMesure = copieMesure.querySelector('.devis-entete');
  if (enteteMesure) {
    enteteMesure.style.display = 'flex';
    enteteMesure.style.flexDirection = 'row';
    enteteMesure.style.justifyContent = 'space-between';
    enteteMesure.style.gap = '8px';
    enteteMesure.style.marginBottom = '10px';
    enteteMesure.style.paddingBottom = '8px';
    var entrepriseMesure = enteteMesure.querySelector('.entreprise-bloc');
    var titreMesure = enteteMesure.querySelector('.titre-bloc');
    if (entrepriseMesure) {
      entrepriseMesure.style.order = enteteMesure.classList.contains('droite') ? '2' : '1';
      entrepriseMesure.style.textAlign = enteteMesure.classList.contains('droite') ? 'right' : 'left';
    }
    if (titreMesure) {
      titreMesure.style.order = enteteMesure.classList.contains('droite') ? '1' : '2';
      titreMesure.style.textAlign = enteteMesure.classList.contains('droite') ? 'left' : 'right';
    }
  }
  copieMesure.querySelectorAll('.logo-entreprise').forEach(function (logo) {
    logo.style.maxWidth = '100px';
    logo.style.maxHeight = '44px';
    logo.style.margin = '0';
  });
  copieMesure.querySelectorAll('.nom-entreprise').forEach(function (nom) {
    nom.style.fontSize = '9.5pt';
    nom.style.lineHeight = '1.2';
    nom.style.paddingBottom = '2px';
    nom.style.borderBottom = '1px solid currentColor';
    nom.style.marginBottom = '0';
  });
  copieMesure.querySelectorAll('.coordonnees-entreprise').forEach(function (coordonnees) {
    coordonnees.style.fontSize = '7.5pt';
    coordonnees.style.lineHeight = '1.25';
  });
  copieMesure.querySelectorAll('.titre-devis').forEach(function (titre) {
    titre.style.fontSize = '16pt';
    titre.style.marginBottom = '3px';
  });
  copieMesure.querySelectorAll('.numero-devis').forEach(function (numero) {
    numero.style.fontSize = '9pt';
    numero.style.marginBottom = '2px';
  });
  copieMesure.querySelectorAll('.date-devis').forEach(function (date) {
    date.style.fontSize = '8pt';
  });
  copieMesure.querySelectorAll('.devis-client').forEach(function (client) {
    client.style.marginBottom = '10px';
    client.style.paddingBottom = '8px';
  });
  copieMesure.querySelectorAll('.coordonnees-client').forEach(function (coordonnees) {
    coordonnees.style.gap = '4px 10px';
    coordonnees.style.fontSize = '8pt';
    coordonnees.style.lineHeight = '1.25';
  });
  copieMesure.querySelectorAll('.devis-objet').forEach(function (objet) {
    objet.style.marginBottom = '8px';
    objet.style.fontSize = '9pt';
  });
  copieMesure.querySelectorAll('.devis-tableau').forEach(function (tableau) {
    tableau.style.marginBottom = '10px';
    tableau.style.fontSize = '8pt';
    tableau.style.lineHeight = '1.2';
  });
  copieMesure.querySelectorAll('.devis-tableau th, .devis-tableau td').forEach(function (cellule) {
    cellule.style.padding = '3px 6px';
  });
  copieMesure.querySelectorAll('.devis-total').forEach(function (total) {
    total.style.marginBottom = '10px';
  });
  copieMesure.querySelectorAll('.ligne-sous-total, .ligne-main-oeuvre').forEach(function (ligne) {
    ligne.style.padding = '4px 8px';
    ligne.style.fontSize = '8pt';
  });
  copieMesure.querySelectorAll('.ligne-total').forEach(function (ligne) {
    ligne.style.padding = '6px 10px';
    ligne.style.gap = '16px';
  });
  copieMesure.querySelectorAll('.label-total').forEach(function (label) {
    label.style.fontSize = '9pt';
  });
  copieMesure.querySelectorAll('.valeur-total').forEach(function (valeur) {
    valeur.style.fontSize = '14pt';
  });
  copieMesure.querySelectorAll('.devis-pied-page').forEach(function (pied) {
    pied.style.paddingTop = '10px';
    pied.style.fontSize = '7pt';
    pied.style.lineHeight = '1.3';
  });
  document.body.appendChild(copieMesure);

  for (var tentative = 0; tentative < 4; tentative += 1) {
    copieMesure.style.width = (largeurA4 / echelle) + 'px';
    var hauteurContenu = Math.max(copieMesure.scrollHeight, 1);
    var prochaineEchelle = Math.min(1, (hauteurA4 / hauteurContenu) * 0.97);
    if (Math.abs(prochaineEchelle - echelle) < 0.005) {
      echelle = prochaineEchelle;
      break;
    }
    echelle = prochaineEchelle;
  }

  copieMesure.remove();
  document.documentElement.style.setProperty('--echelle-impression', String(echelle));
  window.print();
}

function telechargerPDF() {
  imprimerDevis();
}

window.addEventListener('afterprint', function () {
  document.documentElement.style.removeProperty('--echelle-impression');
});

/* ============ UTILITAIRES ============ */

function echapperHtml(texte) {
  if (texte === null || texte === undefined) return '';
  var div = document.createElement('div');
  div.textContent = String(texte);
  return div.innerHTML;
}

var minuteurEnregistrement = null;
function planifierEnregistrement() {
  if (minuteurEnregistrement) clearTimeout(minuteurEnregistrement);
  minuteurEnregistrement = setTimeout(function () {
    enregistrerDonnees();
  }, 1500);
}

var minuteurMessage = null;
function afficherMessage(texte, type) {
  var el = references.messageStatut;
  el.textContent = texte;
  el.className = 'message-statut' + (type ? ' ' + type : '');
  el.hidden = false;
  // Forcer un reflow pour la transition
  void el.offsetWidth;
  el.classList.add('visible');
  if (minuteurMessage) clearTimeout(minuteurMessage);
  minuteurMessage = setTimeout(function () {
    el.classList.remove('visible');
    setTimeout(function () { el.hidden = true; }, 300);
  }, 2500);
}

/* ============ 14. GESTION DES ÉVÉNEMENTS ============ */

function lierEvenements() {
  // Barre d'actions
  references.actionNouveau.addEventListener('click', nouveauDevis);
  references.actionEnregistrer.addEventListener('click', function () {
    enregistrerDonnees();
  });
  references.actionImprimer.addEventListener('click', imprimerDevis);
  references.actionTelecharger.addEventListener('click', telechargerPDF);
  references.actionParametres.addEventListener('click', ouvrirParametres);

  // Logo
  references.inputTeleverserLogo.addEventListener('change', function (e) {
    if (e.target.files && e.target.files[0]) {
      televerserLogo(e.target.files[0]);
      e.target.value = '';
    }
  });
  references.boutonSupprimerLogo.addEventListener('click', supprimerLogo);

  // Position logo — zone entreprise
  references.boutonsPosition.forEach(function (btn) {
    btn.addEventListener('click', function () {
      changerPositionLogo(btn.dataset.position);
    });
  });

  // Position logo — zone apparence
  references.boutonsPositionApp.forEach(function (btn) {
    btn.addEventListener('click', function () {
      changerPositionLogo(btn.dataset.position);
    });
  });

  // Prestations
  references.boutonAjouterPrestation.addEventListener('click', ajouterPrestation);

  // Panneau paramètres
  references.boutonFermerParametres.addEventListener('click', fermerParametres);
  references.overlayPanneau.addEventListener('click', fermerParametres);
  references.parametreDevise.addEventListener('change', function (e) {
    parametres.deviseDefaut = e.target.value;
    enregistrerParametres();
  });
  references.boutonsTheme.forEach(function (btn) {
    btn.addEventListener('click', function () {
      appliquerTheme(btn.dataset.theme);
      enregistrerParametres();
    });
  });
  references.parametrePrefixeNumero.addEventListener('input', function (e) {
    parametres.prefixeNumero = e.target.value;
    enregistrerParametres();
  });
  references.boutonEffacerDonnees.addEventListener('click', function () {
    effacerDonnees();
    reinitialiserDevis();
    afficherMessage('Données effacées');
  });

  // Bascule mobile
  references.boutonsBascule.forEach(function (btn) {
    btn.addEventListener('click', function () {
      basculerVueMobile(btn.dataset.vue);
    });
    btn.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      e.preventDefault();
      var indexActuel = Array.prototype.indexOf.call(references.boutonsBascule, btn);
      var increment = e.key === 'ArrowRight' ? 1 : -1;
      var indexSuivant = (indexActuel + increment + references.boutonsBascule.length) % references.boutonsBascule.length;
      var ongletSuivant = references.boutonsBascule[indexSuivant];
      ongletSuivant.focus();
      basculerVueMobile(ongletSuivant.dataset.vue);
    });
  });

  // Échappement clavier
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (!references.panneauParametres.classList.contains('ouvert')) return;
      fermerParametres();
    }
    // Ctrl/Cmd + P : impression native (laisser le navigateur gérer)
    // Ctrl/Cmd + S : enregistrer
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      enregistrerDonnees();
    }
  });
}

function nouveauDevis() {
  reinitialiserDevis();
  devis.document.numero = genererNumeroDevis();
  devis.document.date = genererDateAujourdhui();
  remplirChampsDocument();
  rendreTableauPrestations();
  rendreCartesPrestations();
  mettreAJourApercu();
  enregistrerDonnees();
  afficherMessage('Nouveau devis créé');
}

function reinitialiserDevis() {
  devis.entreprise = { nom: '', adresse: '', telephone: '', email: '', site: '', legal: '', logo: '' };
  devis.client = { nom: '', adresse: '', telephone: '', email: '' };
  devis.document = { numero: '', date: '', objet: '', devise: parametres.deviseDefaut || 'EUR', mainOeuvre: 0 };
  devis.prestations = [];
  devis.apparence = { positionLogo: 'gauche' };

  remplirChampsEntreprise();
  remplirChampsClient();
  remplirChampsDocument();
  mettreAJourApercuLogo();
  mettreAJourBoutonsPosition();
  rendreTableauPrestations();
  rendreCartesPrestations();
  mettreAJourApercu();
}

function ouvrirParametres() {
  references.panneauParametres.classList.add('ouvert');
  references.panneauParametres.hidden = false;
  references.overlayPanneau.hidden = false;
  void references.overlayPanneau.offsetWidth;
  references.overlayPanneau.classList.add('visible');
  references.parametreDevise.value = parametres.deviseDefaut;
  references.parametrePrefixeNumero.value = parametres.prefixeNumero;
}

function appliquerTheme(theme) {
  var themeValide = theme === 'dark' ? 'dark' : 'light';
  parametres.theme = themeValide;
  document.documentElement.dataset.theme = themeValide;
  references.boutonsTheme.forEach(function (btn) {
    var actif = btn.dataset.theme === themeValide;
    btn.classList.toggle('actif', actif);
    btn.setAttribute('aria-pressed', String(actif));
  });
}

function fermerParametres() {
  references.panneauParametres.classList.remove('ouvert');
  references.overlayPanneau.classList.remove('visible');
  setTimeout(function () {
    references.panneauParametres.hidden = true;
    references.overlayPanneau.hidden = true;
  }, 200);
}

function basculerVueMobile(vue) {
  vueMobileActuelle = vue === 'apercu' ? 'apercu' : 'edition';
  references.boutonsBascule.forEach(function (btn) {
    var actif = btn.dataset.vue === vueMobileActuelle;
    btn.classList.toggle('actif', actif);
    btn.setAttribute('aria-selected', String(actif));
    btn.tabIndex = actif ? 0 : -1;
  });
  if (vueMobileActuelle === 'edition') {
    references.espaceEdition.classList.remove('cache-mobile');
    references.espaceApercus.classList.add('cache-mobile');
  } else {
    references.espaceEdition.classList.add('cache-mobile');
    references.espaceApercus.classList.remove('cache-mobile');
    mettreAJourApercu();
  }
}

var vueMobileActuelle = 'edition';

window.addEventListener('resize', function () {
  if (window.innerWidth <= 768) {
    basculerVueMobile(vueMobileActuelle);
  } else {
    references.espaceEdition.classList.remove('cache-mobile');
    references.espaceApercus.classList.remove('cache-mobile');
  }
});

/* ============ 15. INITIALISATION ============ */

function initialiser() {
  // Charger les données sauvegardées
  chargerDonnees();
  appliquerTheme(parametres.theme);

  // Si vide, pré-remplir avec un numéro et la date du jour
  if (!devis.document.numero) {
    devis.document.numero = genererNumeroDevis();
  }
  if (!devis.document.date) {
    devis.document.date = genererDateAujourdhui();
  }
  if (!devis.document.devise) {
    devis.document.devise = parametres.deviseDefaut || 'EUR';
  }

  // Remplir les champs
  remplirChampsEntreprise();
  remplirChampsClient();
  remplirChampsDocument();
  mettreAJourApercuLogo();
  mettreAJourBoutonsPosition();

  // Lier les événements
  lierChampsEntreprise();
  lierChampsClient();
  lierChampsDocument();
  lierEvenements();

  // Rendu initial
  rendreTableauPrestations();
  rendreCartesPrestations();
  mettreAJourApercu();

  // Détecter le mobile pour bascule initiale
  if (window.innerWidth <= 768) {
    basculerVueMobile('edition');
  }
}

document.addEventListener('DOMContentLoaded', initialiser);
