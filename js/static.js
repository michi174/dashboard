var queues = new Array();
queues['RANKED_SOLO_5x5'] = "Solo/Duo Rangliste";
queues['RANKED_FLEX_SR'] = "Flexi 3v3 Rangliste";
queues['RANKED_TEAM_5x5'] = "Flexi 5v5 Rangliste";

var tiers = new Array();
tiers["IRON"] = "Eisen";
tiers["BRONZE"] = "Bronze";
tiers["SILVER"] = "Silber";
tiers["GOLD"] = "Gold";
tiers["PLATINUM"] = "Platin";
tiers["DIAMOND"] = "Diamant";
tiers["MASTER"] = "Master";
tiers["GRANDMASTER"] = "Grossmeister";
tiers["CHALLENGER"] = "Challenger";
tiers["unranked"] = "Nicht platziert";

var ranks = new Array();
ranks['I'] = 1;
ranks['II'] = 2;
ranks['III'] = 3;
ranks['IV'] = 4;
ranks['V'] = 5;

var lanes = new Array();
lanes["BOTTOM"] = "Bot";
lanes["BOT"] = "Bot";
lanes["MID"] = "Mid";
lanes["TOP"] = "Top";
lanes["NONE"] = "Roam";
lanes["MIDDLE"] = "Mid";
lanes["JUNGLE"] = "Jungle";

var roles = new Array();
roles["DUO"] = "Duo";
roles["DUO_CARRY"] = "AD Carry";
roles["DUO_SUPPORT"] = "Support";
roles["SOLO"] = "Solo";
roles["NONE"] = "";

var comRoles = new Array;
comRoles["MID"] = "Midlaner";
comRoles["SUPPORT"] = "Support";
comRoles["CARRY"] = "AD Carry";
comRoles["TOP"] = "Toplaner";
comRoles["NONE"] = "";
comRoles["JUNGLE"] = "Jungler";

var gameresults = new Array();
gameresults[true] = "Sieg";
gameresults[false] = "Niederlage";

var queue_types = new Array();
queue_types[420] = "Rangliste";
queue_types[430] = "Normal";
queue_types[1200] = "Blitzpartie";
queue_types[1020] = "Alle f�r Einen";
queue_types[840] = "Kooperativ";
queue_types[400] = "Normal";
queue_types[900] = "U.R.F.";
queue_types[460] = "Twisted Treeline";
queue_types[440] = "Flex Rangliste";
queue_types[600] = "Blutjaeger Assasinen";
queue_types[450] = "ARAM";

var platforms = {
    BR1: "br",
    EUN1: "eune",
    EUW1: "euw",
    JP1: "jp",
    KR: "kr",
    LA1: "lan",
    LA2: "las",
    NA1: "na",
    NA: "na",
    OC1: "oce",
    TR1: "tr",
    RU: "ru",
    PBE1: "pbe"
};


var md_graphs = new Object;
md_graphs = {
    totalDamageDealtToChampions: {
        displayName: "Schaden an Champions",
        converter: "",
        manipulator: "",
        active: "active",
        order: 0
    },
    goldEarned: {
        displayName: "Gold",
        converter: "",
        manipulator: "",
        active: "",
        order: 0
    },
    creepScore: {
        displayName: "CS",
        converter: "",
        manipulator: "",
        active: "",
        order: 0
    },
    totalDamageTaken: {
        displayName: "Erlittener Schaden",
        converter: "",
        manipulator: "",
        active: "",
        order: 0
    },
    totalHeal: {
        displayName: "Geheilter Schaden",
        converter: "",
        manipulator: "",
        active: "",
        order: 0
    },
    damageDealtToObjectives: {
        displayName: "Schaden an Objekten",
        converter: "",
        manipulator: "",
        active: "",
        order: 0
    },
    totalDamageDealt: {
        displayName: "Gesamtschaden",
        converter: "",
        manipulator: "",
        active: "",
        order: 0
    },
    visionScore: {
        displayName: "Sichtwertung",
        converter: "",
        manipulator: "",
        active: "",
        order: 0
    },
    longestTimeSpentLiving: {
        displayName: "Max. Lebensdauer",
        converter: "SecondsToMinutes",
        manipulator: "ManipulateGameTimeToLifeTime",
        active: "",
        order: 0
    }
};

var md_SingleStatsCategories = {
    "combat": {
        "displayName": "Kampf",
        "icon": "fas fa-swords"
    },
    "damage": {
        "displayName": "Schaden",
        "icon": "fas fa-crosshairs"
    },
    "defense": {
        "displayName": "Verteidigung",
        "icon": "fab fa-envira"
    },
    "vision": {
        "displayName": "Sicht",
        "icon": "fas fa-eye"
    },
    "income": {
        "displayName": "Einkommen",
        "icon": "fas fa-coins"
    },
    "others": {
        "displayName": "Andere",
        "icon": "fas fa-analytics"
    }
};

var md_SingleStats = {
    "kda": {
        "displayName": "KDA",
        "category": md_SingleStatsCategories.combat,
        "converter": null,
        "append": "",
        "prepend": ""
    },
    "largestKillingSpree": {
        "displayName": "Laengster Blutrausch",
        "category": md_SingleStatsCategories.combat,
        "converter": null,
        "append": "",
        "prepend": ""
    },
    "killingSprees": {
        "displayName": "Anzahl Blutraeusche",
        "category": md_SingleStatsCategories.combat,
        "converter": null,
        "append": "",
        "prepend": ""
    },
    "largestMultiKill": {
        "displayName": "Groesste Mehrfachtoetung",
        "category": md_SingleStatsCategories.combat,
        "converter": null,
        "append": "",
        "prepend": ""
    },
    "timeCCingOthers": {
        "displayName": "CC Wertung",
        "category": md_SingleStatsCategories.combat,
        "converter": null,
        "append": "",
        "prepend": ""
    },
    "longestTimeSpentLiving": {
        "displayName": "Laengste Zeit am Leben",
        "category": md_SingleStatsCategories.combat,
        "converter": null,
        "append": "",
        "prepend": ""
    },
    "firstBloodKill": {
        "displayName": "Erstes Blut",
        "category": md_SingleStatsCategories.combat,
        "converter": null,
        "append": "",
        "prepend": ""
    },
    "totalDamageDealtToChampions": {
        "displayName": "Schaden an Champions",
        "category": md_SingleStatsCategories.damage,
        "converter": null,
        "append": "",
        "prepend": ""
    },
    "magicDamageDealtToChampions": {
        "displayName": "Magischer Schaden an Champions",
        "category": md_SingleStatsCategories.damage,
        "converter": null,
        "append": "",
        "prepend": ""
    },
    "physicalDamageDealtToChampions": {
        "displayName": "Normaler Schaden an Champions",
        "category": md_SingleStatsCategories.damage,
        "converter": null,
        "append": "",
        "prepend": ""
    },
    "trueDamageDealtToChampions": {
        "displayName": "Absoluter Schaden an Champions",
        "category": md_SingleStatsCategories.damage,
        "converter": null,
        "append": "",
        "prepend": ""
    },
    "totalDamageDealt": {
        "displayName": "Verursachter Gesamtschaden",
        "category": md_SingleStatsCategories.damage,
        "converter": null,
        "append": "",
        "prepend": ""
    },
    "magicDamageDealt": {
        "displayName": "Verursachter magischer Schaden",
        "category": md_SingleStatsCategories.damage,
        "converter": null,
        "append": "",
        "prepend": ""
    },
    "physicalDamageDealt": {
        "displayName": "Verursachter normaler Schaden",
        "category": md_SingleStatsCategories.damage,
        "converter": null,
        "append": "",
        "prepend": ""
    },
    "trueDamageDealt": {
        "displayName": "Verursachter absoluter Schaden",
        "category": md_SingleStatsCategories.damage,
        "converter": null,
        "append": "",
        "prepend": ""
    },
    "largestCriticalStrike": {
        "displayName": "Hoechster kritischer Treffer",
        "category": md_SingleStatsCategories.damage,
        "converter": null,
        "append": "",
        "prepend": ""
    },
    "damageDealtToTurrets": {
        "displayName": "Schaden an Tuermen",
        "category": md_SingleStatsCategories.damage,
        "converter": null,
        "append": "",
        "prepend": ""
    },
    "damageDealtToObjectives": {
        "displayName": "Schaden an Zielen",
        "category": md_SingleStatsCategories.damage,
        "converter": null,
        "append": "",
        "prepend": ""
    },
    "totalHeal": {
        "displayName": "Geheilter Schaden",
        "category": md_SingleStatsCategories.defense,
        "converter": null,
        "append": "",
        "prepend": ""
    },
    "totalUnitsHealed": {
        "displayName": "Verbuendete Champions geheilt",
        "category": md_SingleStatsCategories.defense,
        "converter": null,
        "append": "",
        "prepend": ""
    },
    "totalDamageTaken": {
        "displayName": "Erlittner Schaden",
        "category": md_SingleStatsCategories.defense,
        "converter": null,
        "append": "",
        "prepend": ""
    },
    "magicalDamageTaken": {
        "displayName": "Erlittner magischer Schaden",
        "category": md_SingleStatsCategories.defense,
        "converter": null,
        "append": "",
        "prepend": ""
    },
    "physicalDamageTaken": {
        "displayName": "Erlittner normaler Schaden",
        "category": md_SingleStatsCategories.defense,
        "converter": null,
        "append": "",
        "prepend": ""
    },
    "trueDamageTaken": {
        "displayName": "Erlittner absoluter Schaden",
        "category": md_SingleStatsCategories.defense,
        "converter": null,
        "append": "",
        "prepend": ""
    },
    "damageSelfMitigated": {
        "displayName": "Geblockter Schaden",
        "category": md_SingleStatsCategories.defense,
        "converter": null,
        "append": "",
        "prepend": ""
    },
    "visionScore": {
        "displayName": "Sichtwertung",
        "category": md_SingleStatsCategories.vision,
        "converter": null,
        "append": "",
        "prepend": ""
    },
    "wardsPlaced": {
        "displayName": "Augen platziert",
        "category": md_SingleStatsCategories.vision,
        "converter": null,
        "append": "",
        "prepend": ""
    },
    "wardsKilled": {
        "displayName": "Augen zerstoert",
        "category": md_SingleStatsCategories.vision,
        "converter": null,
        "append": "",
        "prepend": ""
    },
    "visionWardsBoughtInGame": {
        "displayName": "Kontrollaugen gekauft",
        "category": md_SingleStatsCategories.vision,
        "converter": null,
        "append": "",
        "prepend": ""
    },
    "goldEarned": {
        "displayName": "Erhaltenes Gold",
        "category": md_SingleStatsCategories.income,
        "converter": null,
        "append": "",
        "prepend": ""
    },
    "goldSpent": {
        "displayName": "Ausgegebenes Gold",
        "category": md_SingleStatsCategories.income,
        "converter": null,
        "append": "",
        "prepend": ""
    },
    "totalMinionsKilled": {
        "displayName": "Vasallen getoetet",
        "category": md_SingleStatsCategories.income,
        "converter": null,
        "append": "",
        "prepend": ""
    },
    "neutralMinionsKilled": {
        "displayName": "Getoetete neutrale Monster",
        "category": md_SingleStatsCategories.income,
        "converter": null,
        "append": "",
        "prepend": ""
    },
    "neutralMinionsKilledTeamJungle": {
        "displayName": "Getoetete neutrale Monster im eigenen Dschungel",
        "category": md_SingleStatsCategories.income,
        "converter": null,
        "append": "",
        "prepend": ""
    },
    "neutralMinionsKilledEnemyJungle": {
        "displayName": "Getoetete neutrale Monster im gegnerischen Dschungel",
        "category": md_SingleStatsCategories.income,
        "converter": null,
        "append": "",
        "prepend": ""
    },
    "turretKills": {
        "displayName": "Tuerme zerstoert",
        "category": md_SingleStatsCategories.others,
        "converter": null,
        "append": "",
        "prepend": ""
    },
    "inhibitorKills": {
        "displayName": "Inhibitoren zerstoert",
        "category": md_SingleStatsCategories.others,
        "converter": null,
        "append": "",
        "prepend": ""
    }


};