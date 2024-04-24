use clap::Parser;

/// Media Center Web
#[derive(Parser, Debug)]
#[command(version, about, long_about = None)]
#[derive(Clone)]
pub struct Args {
    /// Torrent Api Url
    #[arg(short, long, default_value="some_url")]
    pub torrent_api_url: String
}