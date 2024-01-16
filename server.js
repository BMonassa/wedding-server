
import { DatabaseMemory } from './database-memory.js';
// const { DatabasePostgres } = require('./database-postgres.js');
// const database = new DatabaseMemory
import fastifyCors from 'fastify-cors';
import { DatabasePostgres } from './database-postgres.js';
import fastify from 'fastify';
import Stripe from 'stripe';


const stripe = new Stripe('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', {
  apiVersion: '2020-08-27',
});

const server = fastify();

server.register(fastifyCors, {
  origin: true,
});

const database = new DatabasePostgres();

let informacoesGitHub = [];

// Função para obter detalhes adicionais do commit
async function obterDetalhesDoCommit(sha) {
  // Exemplo: faça uma chamada à API do GitHub para obter mais detalhes sobre o commit usando o sha
  // Substitua 'URL_DA_SUA_API_GITHUB' pela URL correta da API do GitHub
  const response = await fetch(`URL_DA_SUA_API_GITHUB/commits/${sha}`);
  const data = await response.json();

  return {
    detalhesAdicionais: data,
  };
}



server.post('/create-checkout-session', async (request, reply) => {

  const {title, name, description, price} = request.body

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'brl',
          product_data: {
            name: 'Presente', // Substitua pelo nome do produto

          },
          unit_amount: price, // Substitua pelo preço em centavos
        },
        quantity: 1, // Substitua pela quantidade necessária
      },
    ],
    mode: 'payment',
    success_url: 'http://localhost:3000', // Substitua pela URL de sucesso
    // cancel_url: 'http://localhost:3000/GiftList', // Substitua pela URL de cancelamento
    // billing_address_collection: 'required',

    // metadata: {
    //   message: message // Adiciona a mensagem no metadata
    // }
  });

  return { id: session.id };
});

server.post('/pagamento', async (request, reply) => {
  const { amount, currency, description, source } = request.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      description,
      payment_method: source,
      confirm: true,
    });

    return { clientSecret: paymentIntent.client_secret };
  } catch (err) {
    reply.code(500).send({ error: err.message });
  }
});
// #####
server.post('/videos', async (request, reply) => {

  const {title, name, description, price} = request.body

  await database.create({
    title,
    name,
    price,
    description
  })

  return reply.status(201).send()
})
// ###

server.get('/videos', async () => {
  const videos = await database.list()

  return videos
})
// ###


server.put('/videos/:id', async (request, reply) => {
  const videoId  = request.params.id
  const {title, name, description, price} = request.body

  await database.update(videoId, {
    title,
    name,
    price,
    description
  })

  return reply.status(204).send()
})
// ###


server.delete('/videos/:id', async (request, reply) => {
  const videoId = request.params.id

  await database.delete(videoId)

  return reply.status(204).send()
})
// ###

server.get('/github-info', async (request, reply) => {
  if (informacoesGitHub.length > 0) {
    const todasInformacoes = informacoesGitHub.map(info => ({
      nomeDoProjeto: info.repository ? info.repository.name : null,
      descricaoDoProjeto: info.repository ? info.repository.description : null,
      branchPadrao: info.repository ? info.repository.default_branch : null,
      commits: info.commits ? info.commits.map(commit => ({
        mensagem: commit.message,
        autor: commit.author ? commit.author.name : null,
        data: commit.timestamp,
      })) : [],
    }));

    reply.code(200).send(todasInformacoes);
  } else {
    reply.code(404).send({ message: 'Nenhuma informação do GitHub disponível.' });
  }
});

server.post('/github-webhook', async (request, reply) => {
  const payload = request.body;

  // Adiciona a nova informação do GitHub à lista
  informacoesGitHub.push(payload);

  console.log('Recebeu um webhook do GitHub:', payload);

  // Adiciona mais detalhes aos commits no payload usando a função obterDetalhesDoCommit
  if (payload.commits) {
    payload.commits = await Promise.all(payload.commits.map(async commit => {
      const commitDetalhado = await obterDetalhesDoCommit(commit.sha);
      return {
        mensagem: commit.message,
        autor: commit.author ? commit.author.name : null,
        data: commit.timestamp,
        ...commitDetalhado,
      };
    }));
  }

  // Responda com um código de status 200 para confirmar o recebimento do webhook
  reply.code(200).send({ received: true });
});


server.listen({
  port: 3333,
})


// Route Parameter - exemplo: localhost:3333/videos/:id

// node - Server
// fastify - micro-framework, rápido e eficiente para Node.js, conhecido por sua capacidade de lidar com rotas de forma extremamente rápida.

// CRUD (Create, Read, Update, Delete)

// POST - Criar - localhost:3333/videos
// GET - Ler (pegar informação)
// PUT - atualizar - localhost:3333/videos/1
// DELETE - deletar - localhost:3333/videos/1
