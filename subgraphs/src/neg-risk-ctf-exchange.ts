import {
  FeeCharged as FeeChargedEvent,
  NewAdmin as NewAdminEvent,
  NewOperator as NewOperatorEvent,
  OrderCancelled as OrderCancelledEvent,
  OrderFilled as OrderFilledEvent,
  OrdersMatched as OrdersMatchedEvent,
  ProxyFactoryUpdated as ProxyFactoryUpdatedEvent,
  RemovedAdmin as RemovedAdminEvent,
  RemovedOperator as RemovedOperatorEvent,
  SafeFactoryUpdated as SafeFactoryUpdatedEvent,
  TokenRegistered as TokenRegisteredEvent,
  TradingPaused as TradingPausedEvent,
  TradingUnpaused as TradingUnpausedEvent,
} from '../generated/NegRiskCtfExchange/NegRiskCtfExchange';
import {
  NegRiskCtfExchangeFeeCharged,
  NegRiskCtfExchangeNewAdmin,
  NegRiskCtfExchangeNewOperator,
  NegRiskCtfExchangeOrderCancelled,
  NegRiskCtfExchangeOrderFilled,
  NegRiskCtfExchangeOrdersMatched,
  NegRiskCtfExchangeProxyFactoryUpdated,
  NegRiskCtfExchangeRemovedAdmin,
  NegRiskCtfExchangeRemovedOperator,
  NegRiskCtfExchangeSafeFactoryUpdated,
  NegRiskCtfExchangeTokenRegistered,
  NegRiskCtfExchangeTradingPaused,
  NegRiskCtfExchangeTradingUnpaused,
} from '../generated/schema';

export function handleFeeCharged(event: FeeChargedEvent): void {
  let entity = new NegRiskCtfExchangeFeeCharged(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.receiver = event.params.receiver;
  entity.tokenId = event.params.tokenId;
  entity.amount = event.params.amount;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}

export function handleNewAdmin(event: NewAdminEvent): void {
  let entity = new NegRiskCtfExchangeNewAdmin(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.newAdminAddress = event.params.newAdminAddress;
  entity.admin = event.params.admin;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}

export function handleNewOperator(event: NewOperatorEvent): void {
  let entity = new NegRiskCtfExchangeNewOperator(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.newOperatorAddress = event.params.newOperatorAddress;
  entity.admin = event.params.admin;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}

export function handleOrderCancelled(event: OrderCancelledEvent): void {
  let entity = new NegRiskCtfExchangeOrderCancelled(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.orderHash = event.params.orderHash;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}

export function handleOrderFilled(event: OrderFilledEvent): void {
  let entity = new NegRiskCtfExchangeOrderFilled(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.orderHash = event.params.orderHash;
  entity.maker = event.params.maker;
  entity.taker = event.params.taker;
  entity.makerAssetId = event.params.makerAssetId;
  entity.takerAssetId = event.params.takerAssetId;
  entity.makerAmountFilled = event.params.makerAmountFilled;
  entity.takerAmountFilled = event.params.takerAmountFilled;
  entity.fee = event.params.fee;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}

export function handleOrdersMatched(event: OrdersMatchedEvent): void {
  let entity = new NegRiskCtfExchangeOrdersMatched(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.takerOrderHash = event.params.takerOrderHash;
  entity.takerOrderMaker = event.params.takerOrderMaker;
  entity.makerAssetId = event.params.makerAssetId;
  entity.takerAssetId = event.params.takerAssetId;
  entity.makerAmountFilled = event.params.makerAmountFilled;
  entity.takerAmountFilled = event.params.takerAmountFilled;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}

export function handleProxyFactoryUpdated(
  event: ProxyFactoryUpdatedEvent
): void {
  let entity = new NegRiskCtfExchangeProxyFactoryUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.oldProxyFactory = event.params.oldProxyFactory;
  entity.newProxyFactory = event.params.newProxyFactory;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}

export function handleRemovedAdmin(event: RemovedAdminEvent): void {
  let entity = new NegRiskCtfExchangeRemovedAdmin(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.removedAdmin = event.params.removedAdmin;
  entity.admin = event.params.admin;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}

export function handleRemovedOperator(event: RemovedOperatorEvent): void {
  let entity = new NegRiskCtfExchangeRemovedOperator(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.removedOperator = event.params.removedOperator;
  entity.admin = event.params.admin;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}

export function handleSafeFactoryUpdated(event: SafeFactoryUpdatedEvent): void {
  let entity = new NegRiskCtfExchangeSafeFactoryUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.oldSafeFactory = event.params.oldSafeFactory;
  entity.newSafeFactory = event.params.newSafeFactory;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}

export function handleTokenRegistered(event: TokenRegisteredEvent): void {
  let entity = new NegRiskCtfExchangeTokenRegistered(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.token0 = event.params.token0;
  entity.token1 = event.params.token1;
  entity.conditionId = event.params.conditionId;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}

export function handleTradingPaused(event: TradingPausedEvent): void {
  let entity = new NegRiskCtfExchangeTradingPaused(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.pauser = event.params.pauser;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}

export function handleTradingUnpaused(event: TradingUnpausedEvent): void {
  let entity = new NegRiskCtfExchangeTradingUnpaused(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.pauser = event.params.pauser;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}
