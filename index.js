//TODO: make it so a user can update songs
//TODO: add "art" to Album schema definition

const express = require('express')
require('dotenv').config()
const { Sequelize, Model, DataTypes } = require('sequelize')
const multer = require('multer')
const fs = require('fs')

const [username, password, database] = [process.env.USERNAME, process.env.PASSWORD, process.env.DATABASE]
const app = express();

app.use(express.static('public'))

const sequelize = new Sequelize(database, username, password, {
	host: 'localhost',
	dialect: 'mysql'
})
const port = process.env.PORT || 5005;

class Song extends Model { }

Song.init({
	id: {
		type: DataTypes.INTEGER,
		primaryKey: true,
		autoIncrement: true
	},
	artist: {
		type: DataTypes.STRING,
		allowNull: false
	},
	album: {
		type: DataTypes.STRING,
		allowNull: false
	},
	title: {
		type: DataTypes.STRING,
		allowNull: false
	},
	source: {
		type: DataTypes.STRING,
		allowNull: false
	}
}, {
	modelName: 'Song',
	sequelize,
	timestamps: false,
	tableName: 'songs'
})

class Album extends Model { }

Album.init({
	id: {
		type: DataTypes.INTEGER,
		primaryKey: true,
		autoIncrement: true
	},
	artist: {
		type: DataTypes.STRING,
		allowNull: false
	},
	title: {
		type: DataTypes.STRING,
		allowNull: false
	},
	art: {
		type: DataTypes.STRING,
		allowNull: false
	}
}, {
	modelName: 'Album',
	sequelize,
	timestamps: false
})

let storage = multer.diskStorage({
	destination: function (req, file, cb) {
		if (file.mimetype.startsWith("image")) {
			if (!fs.existsSync(__dirname + "/public/albumart/" + req.body.album)) {
				console.log("this is an image file")
				fs.mkdir(__dirname + "/public/albumart/" + req.body.album, (err) => {
					if (err) {
						cb(err, null)
					}
					console.log(`Directory ${__dirname}/public/${req.body.album} created`)
				})
			}
			cb(null, __dirname + `/public/albumart/${req.body.album}/`)
		} else if (file.mimetype.startsWith("audio") || file.mimetype.startsWith("video")) {
			console.log("this is a music file")
			if (!fs.existsSync(__dirname + "/public/songsource/" + req.body.album)) {
				fs.mkdir(__dirname + "/public/songsource/" + req.body.album, (err) => {
					if (err) {
						cb(err, null)
					}
					console.log(`File ${__dirname}/public/${file.originalname} uploaded`)
				})
			}
			cb(null, __dirname + `/public/songsource/${req.body.album}/`)
		} else {
			cb("not a valid filetype", null)
		}
	},
	filename: function (req, file, cb) { //TODO: check if file already exists
		console.log(file.destination)
		cb(null, Date.now() + '-' + file.originalname)
	}
})

let upload = multer({ storage })

/** this route returns all songs, sorted by artist and album (in that order)
 * params: none
 * returns: Object
 */
app.get('/songs', (req, res) => { //TODO: add order_by with album and artist TODO: make try/catch block for if there are no songs
	if (req.query['order_by']) {
		if (!req.query['order_dir']) {
			req.query['order_dir'] = "DESC";
		}
		getSongs(true, req.query['order_by'], req.query['order_dir'])
	} else {
		getSongs()
	}

	async function getSongs(order = false, orderValue = '', orderDir = 'DESC') {
		if (order) {
			let songs = await Song.findAll({
				order: [[orderValue, orderDir]]
			})
			res.json(songs)
		} else {
			let songs = await Song.findAll();
			res.json(songs)
		}
	}
})


/**
 * this endpoint returns a song of a specific title (could return multiple if multiple are found)
 * params: song_title
 * returns: Object
 */

app.get('/song/:title', (req, res) => {
	async function getSong() {
		console.log(req.params)
		let song = await Song.findAll({
			where: {
				title: req.params.title
			}
		})
		res.json(song)
	}
	getSong()
})

/** this endpoint returns 
 * params: song_title
 * returns: song_source_file
 */
app.get('/song/:title/source', (req, res) => {
	async function getSong() {
		let song = await Song.findOne({
			where: {
				title: req.params.title
			}
		})
		res.redirect(song.source.split('public')[1])
	}
	getSong()
})

/** returns all albums, sorted by artist
 * params: [order_by]
 * returns: Object
 */
app.get('/albums', (req, res) => {
	async function getSongs(albumTitle) {
		let songs = await Song.findAll({
			where: {
				album: albumTitle
			}
		})
		
		return songs
	}
	async function getAlbums() {
		let albums = await Album.findAll({});
		
		await Promise.all(albums.map(async (album) => {
			let songs = await getSongs(album.title)
			let tempArr = []

			songs.forEach(song => {
				tempArr.push(song.dataValues)
			})
			album.dataValues.songs = tempArr
		}))

		res.json(albums)
	}

	getAlbums()
})

/** returns all albums by a specific artist, sorted alphabetically
 * params: <artist>
 * returns: Object
 */
app.get('/albums/:artist', (req, res) => {
	async function getSongs(albumTitle) {
		let songs = await Song.findAll({
			where: {
				album: albumTitle
			}
		})
		
		return songs
	}
	async function getAlbums() {
		let albums = await Album.findAll({
			where: {
				artist: req.params.artist
			}
		});
		
		await Promise.all(albums.map(async (album) => {
			let songs = await getSongs(album.title)
			let tempArr = []

			songs.forEach(song => {
				tempArr.push(song.dataValues)
			})
			album.dataValues.songs = tempArr
		}))

		res.json(albums)
	}

	getAlbums()
})

/** returns album by specific title, inlcuding all songs
 * params: <title>
 * returns: Object
 */

app.get('/album/:artist/:title', (req, res) => {
	async function getSongs(albumTitle) {
		let songs = await Song.findAll({
			where: {
				album: albumTitle
			}
		})
		
		return songs
	}
	async function getAlbums() {
		let albums = await Album.findAll({
			where: {
				artist: req.params.artist,
				title: req.params.title
			}
		});
		
		await Promise.all(albums.map(async (album) => {
			let songs = await getSongs(album.title)
			let tempArr = []

			songs.forEach(song => {
				tempArr.push(song.dataValues)
			})
			album.dataValues.songs = tempArr
		}))

		res.json(albums)
	}

	getAlbums()
})

/** returns all available data about an artist, including all albums and songs
 * params: <artist>
 * returns: Object
 */
app.get('/artist/:artist', (req, res) => {
	async function findAlbums() {
		let albums = await Album.findAll({
			where: {
				artist: req.params.artist
			}
		})

		await Promise.all(albums.map(async (album) => {
			let songs;
			try {
				songs = await Song.findAll({
					where: {
						artist: album.dataValues.artist
					}
				})
				album.dataValues.songs = songs
			} catch (err) {
				console.log(err)
			}

		}))
			.catch((err) => console.log(err))
		
		res.json({artist: albums})
	}

	findAlbums()
})

/** accepts song creation object
 * params: //TODO
 * returns: {err} or {success}
 */
app.post('/song/', upload.any(), (req, res) => {
	//multipart-formdata
	async function prepare() {
		let numAlbums = await Album.findAll({ where: { title: req.body.album } })
		let numSongs = await Song.findAll({ where: { title: req.body.title } })

		let albumArt;
		req.files.forEach(file => {
			if (file.fieldname == "album_art") {
				albumArt = file; // TODO: make it so that if there is no file it does not error
				albumArt.path = process.env.SERVER_URL + albumArt.path.split('public')[1]
				console.log(albumArt.path)
			}
		})

		if (numSongs.length > 0) {
			res.json({ err: "that song already exists" })
		} else {
			if (numAlbums.length <= 0) {
				//upload album
				Album.create({
					artist: req.body.artist,
					title: req.body.album,
					art: albumArt.path
				})
			}
			uploadSong()
		}
	}

	async function uploadSong() {
		let songSource
		req.files.forEach(file => {
			if (file.fieldname == 'song_source') {
				songSource = file;
			}
		})

		Song.create({
			artist: req.body.artist,
			album: req.body.album,
			title: req.body.title,
			source: songSource.path
		})

		res.json({success: "song created"})
	}
	prepare()
})

app.listen(port, () => console.log(`listening at ${port}`));
