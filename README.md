## Media Center Web

### Development

Your dev env (dev container) should have the following packages installed:
- transmission
- transmission-daemon
- mitmproxy (optional but helpful)

Run:

```bash
$ mitmdump --flow-detail 4
```

```bash
$ transmission-daemon --logfile transmission.log --incomplete-dir .
```

```bash
$ ./do debug
```
#### Tor

If you have tor running on your host, find your host ip on the docker network and run
```bash
$ export TOR_PORT=9051
$ export TOR_IPV4=<docker host ip>
```
...then from your host run:
```bash
$ ncat -l -k -p 9051 -c "ncat 127.0.0.1 9050"
```

### Configuration

```bash
$ export MEDIA_LIBRARY=/workspaces/media-center-web/media
$ export DEBUG_SEARCH_RESPONSE=/workspaces/media-center-web/sample-data/familyguy.json         # or set up tor locally on port 9050
$ export http_proxy=127.0.0.1:8080
```