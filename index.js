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
var quoteccy = [{"geckid":"bitcoin-cash","shorthand":"bch"},
	{"geckid":"bitcoin","shorthand":"btc"},
	{"geckid":"ethereum","shorthand":"eth"},
	{"geckid":"tether","shorthand":"usdt"},
	{"geckid":"litecoin","shorthand":"ltc"},
	{"geckid":"binancecoin","shorthand":"bnb"},
	{"geckid":"binance-usd","shorthand":"busd"}]

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
	status = false
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
		if (status == false){
			console.log(Date() + " start command issued")
			message.channel.send(":yellow_circle: Starting engines...")
			message.channel.send(":green_circle: I am currently monitoring the market for price changes :mag: - use !stop to shut me off")

			mostrecentquotepercent = {}
			var getPercentSpreads = async() => {
				let runepercent = await fetchRuneData();
				for (i=0; i < quoteccy.length; i++) {
					let quotepercent = await fetchCoinData(quoteccy[i]["geckid"]);
					let total = runepercent - quotepercent
					let difference = quotepercent - runepercent
					if (runepercent > quotepercent && total >= 1) {				
						output = new Discord.MessageEmbed()
							.setThumbnail(cointhumb)
							.setImage(runethumb)
							.setTitle('RUNE.'+quoteccy[i]["shorthand"].toString().toUpperCase()+' pool alert!')
							.setAuthor('Asgard LP Update')
							.setDescription('RUNE is outperforming '+quoteccy[i]["geckid"].toString().toUpperCase()+' by '+total.toString().substring(0,5)+"%")
							.addField(":notebook_with_decorative_cover: More Info",'RUNE has changed by '+runepercent.toString().substring(0,5)+'%'+'\n'+quoteccy[i]["geckid"].toString().toUpperCase()+' has changed by '+quotepercent.toString().substring(0,5)+'%')
							.setTimestamp();
						output.coinid = quoteccy[i]
					}
					else if (runepercent < quotepercent && total <= -1) {			
						output = new Discord.MessageEmbed()
							.setThumbnail(cointhumb)
							.setImage(runethumb)
							.setTitle(quoteccy[i]["shorthand"].toString().toUpperCase()+'.RUNE pool alert!')
							.setAuthor('Asgard LP Update')
							.setDescription(quoteccy[i]["geckid"].toString().toUpperCase()+' is outperforming RUNE by '+difference.toString().substring(0,5)+"%")
							.addField(":notebook_with_decorative_cover: More Info",quoteccy[i]["geckid"].toString().toUpperCase()+' has changed by '+quotepercent.toString().substring(0,5)+'%'+'\n'+'RUNE has changed by '+runepercent.toString().substring(0,5)+'%')
							.setTimestamp();
						output.coinid = quoteccy[i]["geckid"]
					}
					else {
						output = false
					}
					if (output !== false) {
						if (mostrecentquotepercent[quoteccy[i]["geckid"]] == quotepercent || mostrecentquotepercent[quoteccy[i]["geckid"]] - quotepercent < 1){
							console.log("Supressing duplicate message for: " + quoteccy[i]["geckid"])
							console.log(output)
						}
						else {
							console.log(output)
							message.channel.send(output);
							mostrecentquotepercent[quoteccy[i]["geckid"]] = quotepercent
						}		 
					}
				}
			}

			timer = setInterval(function(){
				getPercentSpreads()
				console.log("Checking Prices...")
			}, 10000)
			status = true
		}
		else {
			message.channel.send(":red_circle: I can't start if I'm already running :man_running:")
		}
	}

	if (message.content.startsWith (prefix + "stop")) {
		if (status == false){
			message.channel.send(":red_circle: Bringing alert system down ...")
			clearInterval(timer)
			mostrecentquotepercent = {}
			status = false
		} else {
			message.channel.send(":red_circle: It isnt running...")
		}
	}

	if (message.content.startsWith (prefix + "status") || message.content.startsWith (prefix + "help")) {
		if (status == false) {
			message.channel.send("I am not sending alerts right now. Use !start to turn me on!")
		}
		if (status == true) {
			message.channel.send("I am currently monitoring the market for price changes :mag: - use !stop to shut me off")
		}
	}
});
