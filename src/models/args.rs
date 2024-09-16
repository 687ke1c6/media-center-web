use clap::Parser;

/// Media Center Web
#[derive(Parser, Debug)]
#[command(version, about, long_about = None)]
#[derive(Clone)]
pub struct Args {
    /// Torrent Api Url
    #[arg(short, long, default_value="some_url", env)]
    pub torrent_api_url: String,

    /// Transmission IP Address
    #[arg(long, default_value="127.0.0.1", env)]
    pub transmission_ipv4: String,

    /// Torrent Socks5 Proxy Port
    #[arg(long, short('p'), default_value_t=9050, env)]
    pub tor_port: u16,

    /// Torrent Socks5 Proxy IPV4
    #[arg(long, default_value="127.0.0.1", env)]
    pub tor_ipv4: String,

    /// Media Library Path
    #[arg(short, long, default_value="/media", env)]
    pub media_library: String,

    /// Debug Search Response - Path to Json file as response
    #[arg(short, long, env)]
    pub debug_search_response: Option<String>,

    /// Download speed limit kbps
    #[arg(short('s'), long, env)]
    pub speed_limit_down: Option<i32>,
    
    /// Script to run after torrent has complete
    #[arg(short('f'), long, env)]
    pub script_torrent_done_filename: Option<String>
}
