require "yaml"
require "active_support/core_ext/hash/deep_merge"

task :server do
  system('RUBYOPT="-W0" bundle exec jekyll serve --config _config.yml,_staging.config.yml,_develop.config.yml')
end




