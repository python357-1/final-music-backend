This is the FINAL music api, coded in ExpressJS

DOCUMENTATION:
following is all of the endpoints of the api

```
GET /songs

params: none
returns: Object {
	[ song { //TODO
	}]
}
```

```
GET /song/:title

params: <title>
returns: Object {
	id,
	artist,
	album,
	title,
	source
}
```

```
GET /song/:title/source

params: <title>
returns: File
```

```
GET /albums

params: none
returns: Object {
	[ album {
		id,
		artist,
		title,
		songs: [ song {
				id,
				artist,
				title,
				source
		}]
	}]
}
```

```
GET /albums/:artist

params: <artist>
returns: Object {
	[ album {
		id,
		artist,
		songs: [ song {
			id,
			artist,
			album,
			title,
			source
		}]
	}]
}
```

```
GET /album/:artist/:title

params: <artist>, <title>
returns: Array [ album {
	id,
	artist,
	title
	songs: [ song{
		id,
		artist,
		album,
		title,
		source
	}]
}]
```

```
GET /artist/:artist

params: <artist>
returns: Artist {
	[ album {
		id,
		artist,
		title,
		[ song {
			id,
			artist,
			album,
			title,
			source
		}]
	} ] 
}
```

```
POST /song

params: createSong (defined below)
returns: {err} or {success} (defined below)

createSong is an object derived from a multipart form data element. 

{
	title: String
	album: String
	artist: String
	song_source: File,
	album_art: File
}

err: {err: "reason"}

success: {success: "note"}
```