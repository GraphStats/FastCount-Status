const express = require('express');
const fetch = require('node-fetch');
const app = express();
const PORT = 3000;

const services = [
  { name: 'FastCount', url: 'http://fast-count.vercel.app/qdfshjpkjj' },
  { name: 'API', url: 'https://ests.sctools.org/api/get/UCX6OQ3DkcsbYNE6H8uQQuVA' },
  { name: 'API Search', url: 'https://mixerno.space/api/youtube-channel-counter/search/mrbeast' }
];

const serviceStatus = {}; // Exemple: { "FastCount": { status: "UP", uptime: 97.23 } }

services.forEach(service => {
  serviceStatus[service.name] = {
    status: 'UNKNOWN',
    uptime: 100.0
  };
});

async function checkServices() {
  // Création d'un tableau pour stocker toutes les promesses de fetch
  const serviceChecks = services.map(async (service) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000); // 3000 ms timeout

    try {
      const response = await fetch(service.url, { signal: controller.signal });
      clearTimeout(timeout); // Annuler le timeout si la réponse arrive avant
      const isUp = response.ok;
      const previousUptime = serviceStatus[service.name].uptime;

      // Calcul de l'uptime :
      if (isUp) {
        serviceStatus[service.name].uptime = Math.min(previousUptime + 0.2, 100);
        serviceStatus[service.name].status = 'UP';
      } else {
        serviceStatus[service.name].uptime = Math.max(previousUptime - 5, 0);
        serviceStatus[service.name].status = 'DOWN';
      }
    } catch (err) {
      clearTimeout(timeout); // Annuler le timeout en cas d'erreur
      serviceStatus[service.name].uptime = Math.max(serviceStatus[service.name].uptime - 5, 0);
      serviceStatus[service.name].status = 'DOWN';
    }
  });

  // Attendre que toutes les promesses se terminent
  await Promise.all(serviceChecks);
}

// Lancer la vérification toutes les 10 secondes
setInterval(checkServices, 10000);
checkServices(); // première vérification immédiate

app.use(express.static('public'));

app.get('/api/status', (req, res) => {
  const result = services.map(service => ({
    name: service.name,
    status: serviceStatus[service.name].status,
    uptime: serviceStatus[service.name].uptime.toFixed(2)
  }));
  res.json(result);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
