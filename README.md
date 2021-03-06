## Synopsis

This node.js application is a web server, which hosts statistical game server data generated by [SLmod](https://github.com/mrSkortch/DCS-SLmod/tree/develop).

When SLmod is used on a DCS game server, we also need something to send the game data from SLmod to this S3 Server.  That's where [SLmod Stats Cron](https://github.com/Bango1999/SLSC) comes in.
SLSC is another node.js server which runs locally on each DCS game server, and periodically checks for different stats data.  If it finds something new, it sends the data off as a JSON object to your S3 instance.

S3 then, keeps track of the current stats data for all the SLSC servers which are sending it data. S3 also acts as the front end website which can be publicly accessed to view stats for the servers.

[See it in action](http://webdev.science:229)

## Usage

Edit config.js according to your needs. There you can make your own set of tokens for authorization purposes<br/>
But each SLSC server needs one of the tokens you create in this file!

Access `localhost:4000` in your browser to see the client side

Flags:
- `node server.js -v`: verbose logging (recommended to get set up)
- `node server.js -s`: no logging (silent) except for errors
- `node server.js -d`: (default) normal logging

WINDOWS ONLY EASE OF ACCESS:
- you can run the app from any of the S3.bat files
- you can update the app with Update_SLSC.bat
- you can create shortcuts to the S3.bat and place them anywhere you want, and run from that

## Dependencies / Prerequisites

- Git
- [Node.js](https://nodejs.org/en/download/)
- Be hosting a DCS mission using [SLmod](https://github.com/mrSkortch/DCS-SLmod/tree/develop)
- Create/have someone create/someone already created [SLSC](https://github.com/Bango1999/S3) server(s) (1 for each game server)

## Installation

1) From a terminal, `git clone https://github.com/Bango1999/S3.git`

2) Windows users can then click and run 'Update_S3.bat'
   Otherwise, run the command `npm update` from inside the S3 folder

3) Edit config.js in a text editor<br />
   You will see a bunch of 'const' variables<br />
   Set their values according to your personal server/setup. Defaults should mostly be fine :)

4) Windows users can then click and run 'S3_Debug.bat'
   Otherwise, run the server with the command `node server.js -v` from the S3 folder

5) Similarly to steps 1-4, install & configure your [SLSC](https://github.com/Bango1999/SLSC) server(s) on your DCS server PC(s)

6) If the configs and tokens are set up correctly, you will eventually see the S3 server log telling you it received stats data from a SLSC instance.
Default cron recurrence is 1 minute, but if you set it to a longer interval, it will take longer to see results.

7) Access your S3 instance in a browser to verify stats are viewable from the client side (default localhost:4000)

8) [Networking Step] If you are hosting S3 from home, you may have to configure your router to forward port 80 to your S3 instance.

Example:
   - Find the local ip of the machine running S3 (should look like `192.168.x.x`)
   - Forward external port 80 (normal web traffic) to your local IP, on internal port 4000 (default port in config.js)
   - `80` -> `192.168.1.20`:`4000`

## Motivation

I fly helicopter simulations with a unit called the 229th. The simulator is DCS, and the mod is SLmod, which is really neat because it logs game statistics.

The idea was, let's get that data from SLmod and make it web-facing so people can look anytime, say, what their flight hours are for a particular server.

This could help IP's see logged hours, or just let people go and see their kills or deaths.


## API Reference

- /api/dcs/slmod/update -> accepts POST JSON content
- /api/web/fetch -> sends POST JSON content to client

## License

MIT
