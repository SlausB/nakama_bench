FROM python:3.8-slim-buster
RUN apt-get update && apt-get install nano

RUN pip3 install dash dash_extensions pandas
WORKDIR /usr/src/app/plotly

CMD whoami && python3 -u app.py
