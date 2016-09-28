const users = ['Alex', 'Tobbe T', 'Tobbe H', 'Oskar', 'Gustaf'];

exports.bar = function(bar){
    const randomUser = users[getRandomIndex(users.length)];
    const responses = [
        `Vinnare är ${randomUser}s favorit; ${bar.name} på ${bar.address}\n${bar.url}`,
        `Vi ska till <${bar.url}|${bar.name}>\n${bar.address}`
    ];
    return responses[getRandomIndex(responses.length)];
}
function getRandomIndex(length){
    return Math.min((length-1), Math.round(Math.random()*length));
}
