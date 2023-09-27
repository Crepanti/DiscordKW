/////////////////////////////////////////////////////////////////////////////////////////////////////////////
process.setMaxListeners(20); // Ustaw limit nasłuchujących na 20 lub inną sensowną wartość

const puppeteer = require('puppeteer');
const fs = require('fs').promises;

const corsProxy = require('cors-anywhere');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const host = 'localhost';
const port = 8081;

const channelId = "1152813936131977336";
const proxyUrl = 'http://localhost:8081/';
const discordApiUrl = `/api/v9/channels/${channelId}/messages`;

/////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function fetchDataAndSave() {
  const browser = await puppeteer.launch({
    headless: 'true'
  });

  try {
    const promises = [];
    const sValues = [1, 234, 11, 12, 13, 14, 15, 16, 17, 18, 19];

    for (const s of sValues) {
      const page = await browser.newPage();
      const promise = new Promise(async (resolve, reject) => {
        try {
          await page.goto('https://kosmiczni.pl/');

          const gameData = await page.evaluate((sValue) => {
            return new Promise((innerResolve, innerReject) => {
              setTimeout(() => {
                ajax_call({
                  c: 4,
                  f: {
                    login: 'hutims',
                    pass: 'Polska97'
                  }
                }, '/main_page_ajax', true, function (json) {
                  setTimeout(() => {
                    ajax_call({
                      c: 8,
                      s: sValue
                    }, '/main_page_ajax', true, function (json) {
                      innerResolve(json);
                    });
                  }, 2000);
                });
              }, 2000);
            });
          }, s);

          await fs.writeFile(`url/url_${s}.json`, JSON.stringify(gameData.url));

          resolve();
        } catch (error) {
          reject(error);
        } finally {
          await page.close();
        }
      });
      
      promises.push(promise);
    }

    await Promise.all(promises);
  } catch (error) {
    console.error('Wystąpił błąd:', error);
  } finally {
    await browser.close();
    const currentTime = new Date();
    const formattedTime = currentTime.toLocaleTimeString();
    console.log(`Linki Autoryzacyjne dla każdego serwera zostały zaktualizowane w folderze [URL/] (Godzina: ${formattedTime})`);
  }
}

/////

async function gameinfo() {
  const browser = await puppeteer.launch({
    headless: 'true',
  });

  const sValues = [1, 234, 11, 12, 13, 14, 15, 16, 17, 18, 19];

  try {
    await Promise.all(
      sValues.map(async (sValue) => {
        const urlFile = `url/url_${sValue}.json`;
        const urlData = JSON.parse(await fs.readFile(urlFile, 'utf8'));
        const page = await browser.newPage();
        await page.goto(urlData, { timeout: 120000 });

        const infogame = await page.evaluate(() => {
          return new Promise((resolve, reject) => {
            setTimeout(() => {
              (function () {
                let a;
                function f() {
                  if (!a) a = Object.keys(GAME).find((z) => z.startsWith('soc') && z.endsWith('ket'));
                  return a;
                }
                Object.defineProperty(GAME, 'socket', {
                  get: function () {
                    return GAME[f()];
                  },
                });
              })();

              GAME.emitOrder = (data) => GAME.socket.emit('ga', data);

              AUTOLOG = {
                chars: [],
              };

              AUTOLOG.GetChars = function () {
                for (i = 0; i < 1; i++) {
                  char = $("li[data-option=select_char]").eq(i);
                  AUTOLOG.chars.push({ id: char.attr('data-char_id'), source: 'select_char' });
                }
              }();

              GAME.emitOrder({ a: 2, char_id: AUTOLOG.chars[0].id });

              setTimeout(() => {
                let PPListener;
                let result;

                if (!PPListener) {
                  PPListener = function (gr) {
                    if (gr && gr.private_list !== undefined) {
                      result = gr;
                      GAME.socket.off('gr', PPListener);
                      PPListener = null;
                    }
                  };
                  GAME.socket.on('gr', PPListener);
                }
                setTimeout(() => {
                  GAME.emitOrder({ a: 15, type: 1 });
                  setTimeout(() => {
                    resolve(result);
                  }, 1000);
                }, 1500);
              }, 1500);
            }, 1500);
          });
        });

        await fs.writeFile(`planety/planety_${sValue}.json`, JSON.stringify(infogame.private_list, null, 2), 'utf-8');
      })
    );

    const currentTime = new Date();
    const formattedTime = currentTime.toLocaleTimeString();

    console.log(`Informacje dotyczące planet zostały zaktualizowane w folderze [PLANETY/] (Godzina: ${formattedTime})`);
  } catch (error) {
    console.error('Wystąpił błąd:', error);
  } finally {
    await browser.close();
  }
}

/////

async function discordinfo() {

  const { Client, GatewayIntentBits, Partials } = require('discord.js');
  const client = new Client({ intents: [GatewayIntentBits.Guilds], partials: [Partials.Channel] });

  const sendMessage = async () => {
    try {
      const response = await fetch(`${proxyUrl}${discordApiUrl}`, {
        method: "POST",
        headers: {
          "Authorization": `Bot ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          content: message
        })
      });
    } catch (error) {
      console.error(error);
    }
  };
  
  const sValues = [1, 234, 11, 12, 13, 14, 15, 16, 17, 18, 19];

  client.on('ready', async () => {
    const currentTime = new Date();
    const formattedTime = currentTime.toLocaleTimeString();
    console.log(`Zalogowano jako ${client.user.tag} (Godzina: ${formattedTime})`);

    for (let i = 0; i < sValues.length; i++) {
      const sValue = sValues[i];
      try {
        const planetsData = JSON.parse(await fs.readFile(`planety/planety_${sValue}.json`, 'utf8'));
  
        const dataToDisplay = planetsData.map(planet => {
          let type = planet.type;
  
      // Dokonaj zmiany w kolumnie "type" na podstawie wyniku
      switch (planet.type) {
        case 263:
          type = "Bardzo duża";
          break;
        case 262:
          type = "Duża";
          break;
        case 261:
          type = "Średnia";
          break;
        case 260:
          type = "Mała";
          break;
      }
  
      const gravity = planet.gravity;
      const conditions = planet.conditions;
      const pn = planet.pn;
      const type2 = planet.type;
      
      // Oblicz koszt na podstawie wzoru
      const cost = ((gravity + conditions) / 3 * (type2 - 259)).toFixed(0); // Zaokrąglenie do dwóch miejsc po przecinku
  
      return {
        gravity,
        conditions,
        pn,
        type,
        cost,
      };
    });
  
    const kp = `<:kp1:1153005829654581382>`
    const tableHeader = 'Rozmiar | Przyrost | Grawitacja | Warunki | Koszt |';

    const tableRows = dataToDisplay.map(planetData => {
      return `${planetData.type} | (+${planetData.pn}%) | ${planetData.gravity} | ${planetData.conditions} | ${planetData.cost} ${kp}`;
    });  
    
    const channel = client.channels.cache.get(channelId);
    if (channel) {
      const now = new Date();
      const formattedDate = `Data: ${now.getDate().toString().padStart(2, '0')}.${(now.getMonth() + 1).toString().padStart(2, '0')}.${now.getFullYear()} | Godzina: ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const message = `\`\`\`Serwer: ${sValue} (${formattedDate})\`\`\`\n${tableHeader}\n${tableRows.join('\n')}`;
      await channel.send(message);
    } else {
      console.error('Nie znaleziono kanału o podanym ID.');
    }
  } catch (error) {
    console.error(`Błąd podczas przetwarzania pliku planety_${sValue}.json: ${error.message}`);
  }
  finally {
    console.log(`Zaktualizowano Informacje o planetach na Discordzie (Godzina: ${formattedTime})`); // To zostanie wywołane niezależnie od tego, czy wystąpi błąd czy nie.
  }
}
});
  client.login('MTA3NTI0ODM0OTYwMDU2MzIyMA.GOrMhb.zSzzK2vwCn-LJOdua-wgAdmdxyqj7fR6ic9l2o');
}

/* const scheduleAtMidnight = () => {
  const now = new Date();
  const targetTime = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1, // Przejdź do następnego dnia
    0, // Godzina 00
    2, // Minuta 02
    0 // Sekunda 00
  );

  const timeUntilMidnight = targetTime - now;

  if (timeUntilMidnight < 0) {
    targetTime.setDate(targetTime.getDate() + 1);
  }

  const delay = targetTime - now;

  setTimeout(() => {
    fetchDataAndSave()
      .then(() => gameinfo())
      .then(() => discordinfo())
      .then(() => {
        scheduleAtMidnight();
      })
      .catch((error) => {
        console.error('Błąd:', error);
        scheduleAtMidnight();
      });
  }, delay);
};

scheduleAtMidnight(); */