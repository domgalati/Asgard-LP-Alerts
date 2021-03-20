const Discord = require('discord.js');
const CoinGecko = require('coingecko-api');
const DiscordClient  = new Discord.Client();
const CoinGeckoClient = new CoinGecko();

/*Login to discord client*/
DiscordClient.login("ODIxOTU0NjEwODMwMTE0ODI5.YFLO4g.ZvgeF-SfTXbqagopNRbYkJ7xWFM");
DiscordClient.once('ready', () => {
	console.log('Bot Logged Into Discord Channel');
});

/*Ping CoinGecko API*/
var ping = async() => {
	let ping = await CoinGeckoClient.ping();
	console.log(ping);
};
ping()

/*Pairs to check against RUNE*/
var quoteccy = ["bitcoin-cash","bitcoin","ethereum","tether","litecoin","binancecoin","binance-usd"]

/*Fetch rune price increase percentage and thumnail icon*/
var fetchRuneData = async () => {
	let data = await CoinGeckoClient.coins.fetch('thorchain', {tickers: false, community_data: false, developer_data: false, localization: false});
	runedata = data.data.market_data.price_change_percentage_24h;
	runethumb = data.data.image.thumb
	return runedata;
};

/*Fetch ccy coin price increase percentage and thumbnail*/
var fetchCoinData = async(cointocheck) => { 
	let data = await CoinGeckoClient.coins.fetch(cointocheck, {tickers: false, community_data: false, developer_data: false, localization: false});
	coindata = data.data.market_data.price_change_percentage_24h;
	cointhumb = data.data.image.thumb
	return coindata;
}

DiscordClient.on('message', async (message) => {
var prefix = "!";
	if (message.content.startsWith (prefix + "getPercentageChange")) {
		let userinput = message.content
		let usercoin = userinput.substring(21, 100)
		console.log(usercoin)
		let result = await fetchCoinData(usercoin);
		message.channel.send(coindata)
	}

	if (message.content.startsWith (prefix + "fire")) {
		var getPercentSpreads = async() => {
			let runepercent = await fetchRuneData();
			for (i=0; i < quoteccy.length; i++) {
				let quotepercent = await fetchCoinData(quoteccy[i]);
				let total = quotepercent + runepercent
				let difference = quotepercent - runepercent
				if (total >= 3) {				
					output = new Discord.MessageEmbed()
						.setThumbnail(cointhumb)
						.setImage(runethumb)
						.setTitle('rune.'+quoteccy[i]+' pool alert!')
						.setAuthor('Asgard LP Update')
						.setDescription(quoteccy[i].toString().toUpperCase()+' is outperforming RUNE by '+difference+"%!")
						.addField("INFO",quoteccy[i].toString().toUpperCase()+' is up by '+quotepercent+'%!')
						.setTimestamp();
					message.channel.send(output)
				}
				else if (total <= -3) {			
					output = new Discord.MessageEmbed()
						.setThumbnail(cointhumb)
						.setImage(runethumb)
						.setTitle('rune.'+quoteccy[i]+' pool alert!')
						.setAuthor('Asgard LP Update')
						.setDescription('RUNE is outperforming '+quoteccy[i].toString().toUpperCase()+' by '+total+"%!")
						.addField("INFO",'RUNE is up by '+runepercent+'%!')
						.setTimestamp();
					message.channel.send(output)
				}
			}
		}
		getPercentSpreads()
		console.log("done.")
	}
});