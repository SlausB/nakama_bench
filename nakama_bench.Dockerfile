FROM node:16

## solving worker-created files permissions issues on host (see https://vsupalov.com/docker-shared-permissions/ and especially https://medium.com/@nielssj/docker-volumes-and-file-system-permissions-772c1aee23ca):
ARG USER_ID
ARG GROUP_ID
USER root
COPY setup_user_group.sh ./setup_user_group.sh
RUN sh ./setup_user_group.sh
#RUN addgroup --system --gid $GROUP_ID docker || echo 'Group already exists.'
#RUN adduser --system --uid $USER_ID --disabled-password --gecos "" --ingroup $(getent group $GROUP_ID | cut -d: -f1) $(id -nu $USER_ID) || echo 'User already exists.'
#RUN usermod -a -G $(getent group $GROUP_ID | cut -d: -f1) $(id -nu $USER_ID)
# USER $(id -nu $USER_ID)
USER $USER_ID


WORKDIR /usr/src/app
CMD whoami && npm install && npm run dev
