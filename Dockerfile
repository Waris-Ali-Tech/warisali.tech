FROM ruby:2.7

WORKDIR /code
COPY Gemfile Gemfile.lock /code/

RUN bundle install

EXPOSE 4000
CMD ["rake", "server"]