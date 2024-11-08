const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const port = 3000;

app.use(express.json());

const db = new sqlite3.Database('./itemsdb.sqlite', (err) => {
    if (err) {
        console.error('Oops, algo deu errado com o banco de dados!');
    } else {
        console.log('Banco de dados conectado com sucesso!');
    }
});

db.run(`CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    descricao TEXT,
    dataCriacao TEXT DEFAULT CURRENT_TIMESTAMP)`, (err) => {
        if (err) {
            console.error('Falha ao criar a tabela... Algo deu errado!');
        }
});

app.post("/items", (req, res) => {
    const { name, descricao } = req.body;
    const query = `INSERT INTO items(name, descricao) VALUES (?, ?)`;

    db.run(query, [name, descricao], (err) => {
        if (err) {
            res.status(400).json({ message: 'Não foi possível adicionar o item. Tente novamente!' });
        } else {
            res.status(201).json({ id: this.lastID, name, descricao });
        }
    });
});

app.get('/items', (req, res) => {
    const query = "SELECT * FROM items";
    db.all(query, (err, rows) => {
        if (err) {
            console.error('Erro ao tentar buscar os itens:', err.message);
            return res.status(400).json({ message: 'Não conseguimos encontrar os itens. Desculpe!' });
        } else {
            res.status(200).json(rows);
        }
    });
});

app.get('/items/:id', (req, res) => {
    const { id } = req.params;
    const query = 'SELECT * FROM items WHERE id = ?';
    db.get(query, [id], (err, row) => {
        if (err) {
            console.error('Algo deu errado ao procurar o item:', err.message);
            return res.status(400).json({ message: 'Não conseguimos encontrar o item solicitado.' });
        } else {
            res.status(200).json(row);
        }
    });
});

app.put('/items/:id', (req, res) => {
    const { id } = req.params;
    const { name, descricao } = req.body;
    const query = 'UPDATE items SET name = ?, descricao = ? WHERE id = ?';
    db.run(query, [name, descricao, id], function (err) {
        if (err) {
            console.error('Erro ao atualizar o item:', err.message);
            return res.status(400).json({ message: 'Não foi possível atualizar o item. Tente novamente!' });
        }
        if (this.changes === 0) {
            return res.status(404).json({ message: 'Item não encontrado para atualização.' });
        } else {
            res.status(200).json({ id, name, descricao });
        }
    });
});

app.patch('/items/:id', (req, res) => {
    const { id } = req.params;
    const { name, descricao } = req.body;
    const query = 'UPDATE items SET name = ?, descricao = ? WHERE id = ?';
    db.run(query, [name, descricao, id], function (err) {
        if (err) {
            console.error('Erro ao tentar modificar o item:', err.message);
            return res.status(400).json({ message: 'Falha ao modificar o item. Tente novamente!' });
        }
        if (this.changes === 0) {
            return res.status(404).json({ message: 'Item não encontrado para alteração. Ele foi mesmo criado?' });
        } else {
            res.status(200).json({ id, name, descricao });
        }
    });
});

app.delete('/items/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM items WHERE id = ?';
    db.run(query, [id], function (err) {
        if (err) {
            console.error('Erro ao tentar deletar o item:', err.message);
            return res.status(400).json({ message: 'Não conseguimos deletar o item. Tente novamente!' });
        }
        if (this.changes === 0) {
            return res.status(404).json({ message: 'Esse item não existe. Não foi encontrado!' });
        } else {
            res.status(200).json({ message: `Item com id ${id} deletado com sucesso!` });
        }
    });
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
