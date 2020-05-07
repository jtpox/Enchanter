# Enchanter

Enchanter is a script which allows the live streaming of random pre-processed and chunked vods stored in S3.


# Features
### Random Episodes
The default behaviour of the script is set to playing a random episode from any series in the database.

### Request Episodes
Requested episodes will be added into the list which will then be played when the current playing vod finishes.

### Interrupt Request
An interrupt request can be sent which will halt the vod that is currently playing and start the interrupt request.

# How it Works
There are 2 components to this script: **RPC Service** and **Web Service**.

### Web Service
The web service is used to serve the HLS playlist. 

HSL playlist example:
```
#EXTM3U
#EXT-X-VERSION:3
#EXT-X-TARGETDURATION:10
#EXT-X-MEDIA-SEQUENCE:226
#EXTINF:10.000,
https://s3.example.com/streams/e8013a721b39ba502e10/720/fileSequence60.ts
#EXTINF:10.000,
https://s3.example.com/streams/e8013a721b39ba502e10/720/fileSequence61.ts
```
**ff3a4400c588a70563d9** is the folder (as stated in the database) where the chunked vods are stored in your S3 instance.

**fileSequence{n}.ts** is the sequence of the pre-processed and chunked vod.

### RPC Service
The RPC service is used for inter-app communication. For example, Enchanter may be a sub-service to an app which will retrieve current vod and playlist information from the Enchanter RPC.

# Database Structure
Enchanter uses MongoDB. An **Episode** must have a parent **Series**, but not likewise.
For example:
```
Series
{
	_id: 5ea89d91d678ae502c3babc8,
	name: Nisemonogatari,
	altName: [
		Impostory,
		偽物語
	],
	poster: d6491440703b520ee84c.jpg,
}
```
```
Episode
{
	_id: 5ea89d91d678ae502c3babd2,
	name: Tsukihi Phoenix, Part One,
	count: 8, // Episode number.
	duration: 1321, // Duration of episode in seconds.
	parts: 133, // Number of parts in 10-second chunks.
	folder: e8013a721b39ba502e10, // Name of folder where chunks are stored in S3.
	series: 5ea89d91d678ae502c3babc8, // Parent series ID.
	enabled: true, // Will only be played if true.
	hasResolution: [720, 1080], // Pre-processed in available resolution.
}
```

# Setup
### Configuration
Rename `.env.sample` to `.env`. Most of the variables in the file are self-explanatory.

#### S3
This will be the S3 service where the vods are stored
```
S3_URL=http://s3.example.com/streams
```
The playlist will be rendered centered  around the URL. For example, following the database example:
```
https://s3.example.com/streams/e8013a721b39ba502e10/720/fileSequence120.ts
```

#### Streaming
The name for the sequence of files that you have stored in S3. `{n}` will be replaced with an integer.
```
STREAM_FILE_NAME=fileSequence{n}.ts
```


The set time for every sequence in seconds.
```
STREAM_SEGMENT_TIME=10
```

Amount of time before vod can be played again (in hours).
```
VOD_CUTOFF_TIME=6
```

A range of available stream resolutions for playlists (separated by commas).

If the vod does not have a resolution in the list, the next lowest will be chosen. For example, if 480 is not available, 720 will be chosen.
```
STREAM_RESOLUTION=1080,720
```


### Adding Vods
Vods are to be pre-processed into accepted resolutions and cut into chunks specified in `STREAM_SEGMENT_TIME` and renamed as specified in `STREAM_FILE_NAME` where `{n}` is the playing sequence (starting from 0).

For example, Nisemonogatari episode 8 is *1310s* long and the vod will be cut into 133 parts of chunks up to 10 seconds (according to `STREAM_SEGMENT_TIME`).

The files are then to be uploaded into S3 according to the `folder`  variable in the `episodes` database object.

### Running Service
To run it normally: `node dist/enchanter.js`

Recommended to run it in pm2: `pm2 start dist/enchanter.js`

Viewing HLS playlist: http://example.com:8080/{STREAM_RESOLUTION}

# Libraries Used

 - [Mongoose](https://www.npmjs.com/package/mongoose)
 - [dotenv](https://www.npmjs.com/package/dotenv)
 - [express](https://www.npmjs.com/package/express)
 - [rpc-websockets](https://www.npmjs.com/package/mongoose)
 - [winston](https://www.npmjs.com/package/winston)

# Author's Notes
This is created from the boredome of the 2020 ~~lockdown~~ circuit breaker in Singapore. I do not condone the use of this script for illegal means.

If you have any improvements to suggest or bugs discovered to fix, feel free to send a pull request!

Thank you for reading through.