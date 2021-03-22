const Discord = require('discord.js');
const CoinGecko = require('coingecko-api');
const DiscordClient  = new Discord.Client();
const CoinGeckoClient = new CoinGecko();

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
	var coinDataRequest = async() => {
		const attempts = 5; const delay = 2000;
		for (let x = 0; x < attempts; x++) {
			try {
				return await CoinGeckoClient.coins.fetch(cointocheck, {tickers: false, community_data: false, developer_data: false, localization: false});
			}
			catch (e) {
				await new Promise(r => setTimeout(r, attempts));
			}
		}
	}
	data = await coinDataRequest()
	coindata = data.data.market_data.price_change_percentage_24h;
	cointhumb = data.data.image.thumb
	return coindata;
}

/*Discord Functions*/

/*Login to discord client*/
DiscordClient.login("ODIxOTU0NjEwODMwMTE0ODI5.YFLO4g.ZvgeF-SfTXbqagopNRbYkJ7xWFM");
DiscordClient.once('ready', () => {
	console.log('Bot Logged Into Discord Channel');
});
var timer
DiscordClient.on('message', async (message) => {
	var prefix = "!";
	
	if (message.content.startsWith (prefix + "getPercentageChange")) {
		let userinput = message.content
		let usercoin = userinput.substring(21, 100)
		console.log(usercoin)
		let result = await fetchCoinData(usercoin);
		message.channel.send(coindata)
	}

	if (message.content.startsWith (prefix + "start")){
		mostrecentquotepercent = {}
		var getPercentSpreads = async() => {
			let runepercent = await fetchRuneData();
			for (i=0; i < quoteccy.length; i++) {
				let quotepercent = await fetchCoinData(quoteccy[i]);
				let total = runepercent - quotepercent
				let difference = quotepercent - runepercent
				if (runepercent > quotepercent && total >= 1) {				
					output = new Discord.MessageEmbed()
						.setThumbnail(cointhumb)
						.setImage(runethumb)
						.setTitle('rune.'+quoteccy[i]+' pool alert!')
						.setAuthor('Asgard LP Update')
						.setDescription('RUNE is outperforming '+quoteccy[i].toString().toUpperCase()+' by '+total+"%!")
						.addField("INFO",'RUNE has changed by '+runepercent+'%!', false)
						.setTimestamp();
					output.coinid = quoteccy[i]
				}
				else if (runepercent < quotepercent && total <= -1) {			
					output = new Discord.MessageEmbed()
						.setThumbnail(cointhumb)
						.setImage(runethumb)
						.setTitle('rune.'+quoteccy[i]+' pool alert!')
						.setAuthor('Asgard LP Update')
						.setDescription(quoteccy[i].toString().toUpperCase()+' is outperforming RUNE by '+difference+"%!")
						.addField("INFO",quoteccy[i].toString().toUpperCase()+' has changed by '+quotepercent+'%!')
						.setTimestamp();
					output.coinid = quoteccy[i]
				}
				else {
					output = false
				}
				if (output !== false) {
					if (mostrecentquotepercent[quoteccy[i]] == quotepercent || mostrecentquotepercent[quoteccy[i]] - quotepercent < 1){
						console.log("Supressing duplicate message for: " + quoteccy[i])
						console.log(output)
					}
					else {
						console.log(output)
						message.channel.send(output);
						mostrecentquotepercent[quoteccy[i]] = quotepercent
					}		 
				}
			}
		}
		timer = setInterval(function(){
			getPercentSpreads()
			console.log("Checking Prices...")
		}, 10000)
	}

	if (message.content.startsWith (prefix + "stop")) {
		message.channel.send("Stopping alerts...")
		clearInterval(timer)
	}
});
