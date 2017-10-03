export const RabbitRxUrl = process.env.RABBITMQ_BIGWIG_RX_URL || 'amqp://localhost:5672';
export const RabbitTxUrl = process.env.RABBITMQ_BIGWIG_TX_URL || 'amqp://localhost:5672';
export const DatabaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:mysecretpassword@localhost:5432/storebook_db';
export const NodePort = process.env.PORT || 5000;