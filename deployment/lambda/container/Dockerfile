FROM public.ecr.aws/lambda/nodejs:20

# Set environment variables
ENV NODE_PATH=${LAMBDA_TASK_ROOT}/node_modules
ENV PATH=${PATH}:${LAMBDA_TASK_ROOT}/node_modules/.bin

# Copy package files
COPY package*.json ${LAMBDA_TASK_ROOT}/
RUN npm install --production

# Copy source maintaining directory structure
COPY dist/ ${LAMBDA_TASK_ROOT}/

# Verify x86_64 architecture and setup
RUN if [ "$(uname -m)" != "x86_64" ]; then echo "Error: x86_64 architecture required" && exit 1; fi && \
    echo "System architecture: $(uname -m)" && \
    echo "Node.js version: $(node -v)" && \
    echo "NPM version: $(npm -v)" && \
    echo "NODE_PATH: ${NODE_PATH}" && \
    echo "Lambda Task Root contents:" && \
    ls -la ${LAMBDA_TASK_ROOT} && \
    echo "Handler location:" && \
    ls -la ${LAMBDA_TASK_ROOT}/infrastructure/lambda/handler.js && \
    chmod 755 /lambda-entrypoint.sh

# Set the handler
CMD ["infrastructure/lambda/handler.handler"]
