const express = require('express');
const fs = require('fs');


const app = express();
const port = 8000;


const charactersPath = path.join(__dirname, 'characters.json');

//function to reand characters
function characterReader() {
    const data = fs.readFileSync(charactersPath)
}

//function to create characters
function characterCreater(character) {
    fs.writeFileSync(charactersPath, JSON.stringify(character, null, 2))
}

//all routes
app.get('/', (req, res) => {
    const characters = characterReader();
    res.render('index', { characters });
});

app.post('/add', (req, res) => {
    const characters = characterReader();
    const newCharacter = {
        id: Date.now().toString(),
        name: req.body.name,
        realName: req.body.realName,
        universe: req.body.universe,
    }
    characters.push(newCharacter);
    characterCreater(characters);
    res.redirect('/');
})

app.post('/update/:id', (req, res) => {
    const characters = characterReader();
    const index = characters.findIndex(character => character.id === req.params.id);

    if(index !== -1) {
        characters[index] ={
            ...characters[index],
            name: req.body.name || characters[index].name,
            realName: req.body.realName || characters[index].realName,
            universe: req.body.universe || characters[index].universe
        }
    }
    characterCreater(characters);
    res.redirect('/');
})

app.get('/search', (req, res) => {
    const query = req.query.q.toLowerCase();
    const characters = characterReader();
    const filtered = characters.filter (character =>
        character.name.toLowerCase().includes(query) || character.realName.toLowerCase().includes(query)
    );
    res.render('index', { characters: filtered, searchQuery: query});
});



app.listen(port, () => {
    console.log(`The server is running on http://localhost:${port}`);
})