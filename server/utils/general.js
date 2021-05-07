const bcrypt = require('bcryptjs');
const config = require('config');
const jwt = require("jsonwebtoken");
const JWT_SECRET = config.get('JWT_SECRET');
const $ = require('cheerio');

function convertToNumber(str) {
    return Number(str.replace(/,/g, ''))
}

function generate5CharacterCode(){
    return getRandomInt(1679616, 60466176).toString(36).toUpperCase()
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

function encryptPassword(password)
{
    const salt = bcrypt.genSaltSync(10);
    if (!salt) throw Error('Something went wrong with bcrypt');

    const hash = bcrypt.hashSync(password, salt);
    if (!hash) throw Error('Something went wrong hashing the password');
    return hash;
}

function createAuthToken(userId, userType){
    return jwt.sign({ userId, userType }, JWT_SECRET, { expiresIn: 60*60*24 });
}

function dailySummary(html, category){
    let cat = matchText($(html).find('table.DAILY-SUMMARY td.CATEGORY a'), category).parent().parent();
    return {
        total: () => {return convertToNumber(cat.find("td.TOTAL").text())},
        net: () => {return convertToNumber(cat.find("td.NET").text())}
    };
}

function matchText(selector, text){
    return selector.filter(function() {
        return $(this).text().trim() === text;
    });
}

module.exports = {convertToNumber, generate5CharacterCode, encryptPassword, createAuthToken, dailySummary, matchText};