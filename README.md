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
$ export TOR_PROXY_ADDR=<docker host ip>:9051
```
...then from your host run:
```bash
$ ncat -l -k -p 9051 -c "ncat 127.0.0.1 9050"
```

### Configuration

```bash
$ export MEDIA_LIBRARY=/workspaces/media-center-web/media
$ export DEBUG_SEARCH_RESPONSE=true         # or set up tor locally on port 9050
$ export http_proxy=127.0.0.1:8080
```