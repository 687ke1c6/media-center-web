use clap::Parser;

/// Media Center Web
#[derive(Parser, Debug)]
#[command(version, about, long_about = None)]
#[derive(Clone)]
pub struct Args {

    /// Transmission IP Address
    #[arg(long, env)]
    pub transmission_ipv4: String,

    /// Transmission Port
    #[arg(long, default_value_t=9091, env)]
    pub transmission_port: u16,

    /// Media Library Path
    #[arg(short, long, default_value="/media", env)]
    pub media_library: String,

    #[arg(short, long, default_value_t=5, env)]
    pub torrent_refresh_secs: u16,

    /// Download speed limit kbps
    #[arg(short('s'), long, env)]
    pub speed_limit_down: Option<i32>,
    
    /// Script to run after torrent has complete
    #[arg(short('f'), long, env)]
    pub script_torrent_done_filename: Option<String>,

    /// Prowlarr IPv4 Address
    #[arg(short('r'), long, env)]
    pub prowlarr_ipv4: String,

    /// Prowlarr Port
    #[arg(long, default_value_t=9696, env)]
    pub prowlarr_port: u16,

    // Prowlarr API Key
    #[arg(long, env, default_value="<API_KEY>")]
    pub prowlarr_api_key: String,
}
