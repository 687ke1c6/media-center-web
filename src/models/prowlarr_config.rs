use serde::Deserialize;
use anyhow::Result;

#[derive(Debug, Deserialize)]
#[derive(Clone)]
pub struct ProwlarrConfig {
    #[serde(rename = "ApiKey")]
    pub api_key: String,
}

impl ProwlarrConfig {
    pub fn from_string(xml: &str) -> Result<Self> {
        let config: ProwlarrConfig = quick_xml::de::from_str(xml).expect("Could not parse XML");
        Ok(config)
    }
}