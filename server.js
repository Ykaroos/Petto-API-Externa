const express = require('express');
const { google } = require('googleapis');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.SERVICE_ACCOUNT_JSON),
  scopes: ['https://www.googleapis.com/auth/calendar'],
});

const calendar = google.calendar({ version: 'v3', auth });

const calendarId = '5dc98724be6cf07767777187e9ac858ffa6d662d5fe1b6fd895b30c2d31ea49b@group.calendar.google.com';

app.get('/', (req, res) => {
  res.send('API do calendário funcionando!');
});

app.post('/create-event', async (req, res) => {
  try {
    const {
      summary,
      description,
      startDateTime,
      endDateTime,
      startDate,
      endDate,
    } = req.body;

    const event = {
      summary,
      description,
    };

    if (startDateTime && endDateTime) {
      event.start = {
        dateTime: startDateTime,
        timeZone: 'America/Sao_Paulo',
      };
      event.end = {
        dateTime: endDateTime,
        timeZone: 'America/Sao_Paulo',
      };
    } else if (startDate && endDate) {
      event.start = {
        date: startDate,
        timeZone: 'America/Sao_Paulo',
      };
      event.end = {
        date: endDate,
        timeZone: 'America/Sao_Paulo',
      };
    } else {
      return res.status(400).json({ error: 'Datas de início e fim inválidas.' });
    }

    const response = await calendar.events.insert({
      calendarId,
      resource: event,
    });

    res.status(200).json({ message: 'Evento criado com sucesso!', event: response.data });
  } catch (error) {
    console.error('Erro ao criar evento:', error);
    res.status(500).json({ error: 'Erro ao criar evento' });
  }
});

app.get('/list-events', async (req, res) => {
  try {
    const response = await calendar.events.list({
      calendarId,
      timeMin: new Date().toISOString(),
      maxResults: 20,
      singleEvents: true,
      orderBy: 'startTime',
    });

    res.status(200).json(response.data.items);
  } catch (error) {
    console.error('Erro ao listar eventos:', error);
    res.status(500).json({ error: 'Erro ao listar eventos' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
