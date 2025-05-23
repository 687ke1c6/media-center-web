use crate::Args;
use crate::ProwlarrConfig;

#[derive(Clone)]
pub struct AxumState {
    pub args: Args,
    pub prowlarr_config: ProwlarrConfig,
}

impl AxumState {
    pub fn new(args: Args, prowlarr_config: ProwlarrConfig) -> Self {
        AxumState { args, prowlarr_config }
    }
}