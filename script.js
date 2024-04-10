const RIOT_API_KEY = <YOUR RIOT API KEY GOES HERE>;
const client_id = <YOUR CLIENT ID GOES HERE>;
const client_secret = <YOUR CLIENT SECRET GOES HERE>;
const refresh_token = <YOUR REFRESH TOKEN GOES HERE>;
const riotProxyServer = 'http://localhost:3000';

async function main() {
  console.log('Main function called');
  const live = await isLive();
  const stream_start = getTimeUTC(live);
  if (stream_start === 0) {
    console.log('ImSoBored is not live');
    document.getElementById('winloss').innerHTML = 'Offline';
    document.getElementById('killdeath').innerHTML = 'Offline';
    document.getElementById('totalgold').innerHTML = 'Offline';
    return 0;
  }
  const puuid = await getPUUID();
  const matches = await getMatches(puuid);
  let kills = 0;
  let deaths = 0;
  let wins = 0;
  let losses = 0;
  let totalGold = 0;
  for (let i = 0; i < matches.length; i++) {
    const matchInfo = await getMatchInfo(matches[i]);
    if (matchInfo.info.gameCreation < stream_start) {
      break;
    }
    const player = matchInfo.info.participants.find((player) => player.riotIdGamename === 'ImSoBored');
    kills += player.kills;
    deaths += player.deaths;
    player.win ? (wins += 1) : (losses += 1);
    totalGold += player.goldEarned;
  }
  document.getElementById('winloss').innerHTML = `${wins}-${losses}`;
  document.getElementById('killdeath').innerHTML = `${kills}-${deaths}`;
  document.getElementById('totalgold').innerHTML = totalGold;

}

async function getMatchInfo(matchId) {
  const response = await axios.get(`${riotProxyServer}?url=https://americas.api.riotgames.com/lol/match/v5/matches/${matchId}?api_key=${RIOT_API_KEY}`);
  console.log('Fetched Match');
  const data = response.data;
  return data;
}

async function getMatches(puuid) {
  const response = await axios.get(`${riotProxyServer}?url=https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?api_key=${RIOT_API_KEY}`);
  console.log('Fetched matchids');
  const data = response.data;
  return data;
}

async function getPUUID() {
  console.log('Fetching PUUID...');
  const response = await axios.get(`${riotProxyServer}?url=https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/ImSoBored/6969?api_key=${RIOT_API_KEY}`);
  console.log('Fetched PUUID');
  const puuid = response.data.puuid;
  return puuid;
}

function getTimeUTC(started_at) {
  const date = new Date(started_at);
  const millis = date.getTime();
  return millis;
}

async function isLive() {
  const response = await axios.post('https://id.twitch.tv/oauth2/token', null, {
    params: {
      client_id: client_id,
      client_secret: client_secret,
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    }
  });
  console.log('Fetched token!');
  const token = response.data.access_token;
  const response1 = await axios.get('https://api.twitch.tv/helix/streams?user_login=ImSoBored', {
    headers: {
      Authorization: `Bearer ${token}`, 'Client-Id': client_id
    }
  });
  console.log('Fetched stream info');
  if (response1.data.data[0]?.id) {
    return response1.data.data[0].started_at;
  }
  return false;
}

window.addEventListener('DOMContentLoaded', async () => {
  await main();
});
