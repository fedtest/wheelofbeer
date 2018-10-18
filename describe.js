const users = ['Marcel', 'Tobbe T', 'Tobbe H', 'Siri'];

exports.bar = function(bar){
    const randomUser = users[getRandomIndex(users.length)];
    const responses = [
        `Vinnare är ${randomUser}s favorit; ${bar.name}`,
        `Vi ska till ${bar.name}`
    ];
    return responses[getRandomIndex(responses.length)];
}
function getRandomIndex(length){
    return Math.min((length-1), Math.round(Math.random()*length));
}
