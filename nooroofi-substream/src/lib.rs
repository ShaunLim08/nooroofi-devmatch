mod abi;
mod pb;
use hex_literal::hex;
use pb::contract::v1 as contract;
use substreams::Hex;
use substreams_ethereum::pb::eth::v2 as eth;
use substreams_ethereum::Event;

#[allow(unused_imports)]
use num_traits::cast::ToPrimitive;
use std::str::FromStr;
use substreams::scalar::BigDecimal;

substreams_ethereum::init!();

const POLYMARKETCTF_TRACKED_CONTRACT: [u8; 20] = hex!("4bfb41d5b3570defd03c39a9a4d8de6bd8b8982e");

fn map_polymarketctf_events(blk: &eth::Block, events: &mut contract::Events) {
    events.polymarketctf_fee_chargeds.append(&mut blk
        .receipts()
        .flat_map(|view| {
            view.receipt.logs.iter()
                .filter(|log| log.address == POLYMARKETCTF_TRACKED_CONTRACT)
                .filter_map(|log| {
                    if let Some(event) = abi::polymarketctf_contract::events::FeeCharged::match_and_decode(log) {
                        return Some(contract::PolymarketctfFeeCharged {
                            evt_tx_hash: Hex(&view.transaction.hash).to_string(),
                            evt_index: log.block_index,
                            evt_block_time: Some(blk.timestamp().to_owned()),
                            evt_block_number: blk.number,
                            amount: event.amount.to_string(),
                            receiver: event.receiver,
                            token_id: event.token_id.to_string(),
                        });
                    }

                    None
                })
        })
        .collect());
    events.polymarketctf_new_admins.append(&mut blk
        .receipts()
        .flat_map(|view| {
            view.receipt.logs.iter()
                .filter(|log| log.address == POLYMARKETCTF_TRACKED_CONTRACT)
                .filter_map(|log| {
                    if let Some(event) = abi::polymarketctf_contract::events::NewAdmin::match_and_decode(log) {
                        return Some(contract::PolymarketctfNewAdmin {
                            evt_tx_hash: Hex(&view.transaction.hash).to_string(),
                            evt_index: log.block_index,
                            evt_block_time: Some(blk.timestamp().to_owned()),
                            evt_block_number: blk.number,
                            admin: event.admin,
                            new_admin_address: event.new_admin_address,
                        });
                    }

                    None
                })
        })
        .collect());
    events.polymarketctf_new_operators.append(&mut blk
        .receipts()
        .flat_map(|view| {
            view.receipt.logs.iter()
                .filter(|log| log.address == POLYMARKETCTF_TRACKED_CONTRACT)
                .filter_map(|log| {
                    if let Some(event) = abi::polymarketctf_contract::events::NewOperator::match_and_decode(log) {
                        return Some(contract::PolymarketctfNewOperator {
                            evt_tx_hash: Hex(&view.transaction.hash).to_string(),
                            evt_index: log.block_index,
                            evt_block_time: Some(blk.timestamp().to_owned()),
                            evt_block_number: blk.number,
                            admin: event.admin,
                            new_operator_address: event.new_operator_address,
                        });
                    }

                    None
                })
        })
        .collect());
    events.polymarketctf_order_cancelleds.append(&mut blk
        .receipts()
        .flat_map(|view| {
            view.receipt.logs.iter()
                .filter(|log| log.address == POLYMARKETCTF_TRACKED_CONTRACT)
                .filter_map(|log| {
                    if let Some(event) = abi::polymarketctf_contract::events::OrderCancelled::match_and_decode(log) {
                        return Some(contract::PolymarketctfOrderCancelled {
                            evt_tx_hash: Hex(&view.transaction.hash).to_string(),
                            evt_index: log.block_index,
                            evt_block_time: Some(blk.timestamp().to_owned()),
                            evt_block_number: blk.number,
                            order_hash: Vec::from(event.order_hash),
                        });
                    }

                    None
                })
        })
        .collect());
    events.polymarketctf_order_filleds.append(&mut blk
        .receipts()
        .flat_map(|view| {
            view.receipt.logs.iter()
                .filter(|log| log.address == POLYMARKETCTF_TRACKED_CONTRACT)
                .filter_map(|log| {
                    if let Some(event) = abi::polymarketctf_contract::events::OrderFilled::match_and_decode(log) {
                        return Some(contract::PolymarketctfOrderFilled {
                            evt_tx_hash: Hex(&view.transaction.hash).to_string(),
                            evt_index: log.block_index,
                            evt_block_time: Some(blk.timestamp().to_owned()),
                            evt_block_number: blk.number,
                            fee: event.fee.to_string(),
                            maker: event.maker,
                            maker_amount_filled: event.maker_amount_filled.to_string(),
                            maker_asset_id: event.maker_asset_id.to_string(),
                            order_hash: Vec::from(event.order_hash),
                            taker: event.taker,
                            taker_amount_filled: event.taker_amount_filled.to_string(),
                            taker_asset_id: event.taker_asset_id.to_string(),
                        });
                    }

                    None
                })
        })
        .collect());
    events.polymarketctf_orders_matcheds.append(&mut blk
        .receipts()
        .flat_map(|view| {
            view.receipt.logs.iter()
                .filter(|log| log.address == POLYMARKETCTF_TRACKED_CONTRACT)
                .filter_map(|log| {
                    if let Some(event) = abi::polymarketctf_contract::events::OrdersMatched::match_and_decode(log) {
                        return Some(contract::PolymarketctfOrdersMatched {
                            evt_tx_hash: Hex(&view.transaction.hash).to_string(),
                            evt_index: log.block_index,
                            evt_block_time: Some(blk.timestamp().to_owned()),
                            evt_block_number: blk.number,
                            maker_amount_filled: event.maker_amount_filled.to_string(),
                            maker_asset_id: event.maker_asset_id.to_string(),
                            taker_amount_filled: event.taker_amount_filled.to_string(),
                            taker_asset_id: event.taker_asset_id.to_string(),
                            taker_order_hash: Vec::from(event.taker_order_hash),
                            taker_order_maker: event.taker_order_maker,
                        });
                    }

                    None
                })
        })
        .collect());
    events.polymarketctf_proxy_factory_updateds.append(&mut blk
        .receipts()
        .flat_map(|view| {
            view.receipt.logs.iter()
                .filter(|log| log.address == POLYMARKETCTF_TRACKED_CONTRACT)
                .filter_map(|log| {
                    if let Some(event) = abi::polymarketctf_contract::events::ProxyFactoryUpdated::match_and_decode(log) {
                        return Some(contract::PolymarketctfProxyFactoryUpdated {
                            evt_tx_hash: Hex(&view.transaction.hash).to_string(),
                            evt_index: log.block_index,
                            evt_block_time: Some(blk.timestamp().to_owned()),
                            evt_block_number: blk.number,
                            new_proxy_factory: event.new_proxy_factory,
                            old_proxy_factory: event.old_proxy_factory,
                        });
                    }

                    None
                })
        })
        .collect());
    events.polymarketctf_removed_admins.append(&mut blk
        .receipts()
        .flat_map(|view| {
            view.receipt.logs.iter()
                .filter(|log| log.address == POLYMARKETCTF_TRACKED_CONTRACT)
                .filter_map(|log| {
                    if let Some(event) = abi::polymarketctf_contract::events::RemovedAdmin::match_and_decode(log) {
                        return Some(contract::PolymarketctfRemovedAdmin {
                            evt_tx_hash: Hex(&view.transaction.hash).to_string(),
                            evt_index: log.block_index,
                            evt_block_time: Some(blk.timestamp().to_owned()),
                            evt_block_number: blk.number,
                            admin: event.admin,
                            removed_admin: event.removed_admin,
                        });
                    }

                    None
                })
        })
        .collect());
    events.polymarketctf_removed_operators.append(&mut blk
        .receipts()
        .flat_map(|view| {
            view.receipt.logs.iter()
                .filter(|log| log.address == POLYMARKETCTF_TRACKED_CONTRACT)
                .filter_map(|log| {
                    if let Some(event) = abi::polymarketctf_contract::events::RemovedOperator::match_and_decode(log) {
                        return Some(contract::PolymarketctfRemovedOperator {
                            evt_tx_hash: Hex(&view.transaction.hash).to_string(),
                            evt_index: log.block_index,
                            evt_block_time: Some(blk.timestamp().to_owned()),
                            evt_block_number: blk.number,
                            admin: event.admin,
                            removed_operator: event.removed_operator,
                        });
                    }

                    None
                })
        })
        .collect());
    events.polymarketctf_safe_factory_updateds.append(&mut blk
        .receipts()
        .flat_map(|view| {
            view.receipt.logs.iter()
                .filter(|log| log.address == POLYMARKETCTF_TRACKED_CONTRACT)
                .filter_map(|log| {
                    if let Some(event) = abi::polymarketctf_contract::events::SafeFactoryUpdated::match_and_decode(log) {
                        return Some(contract::PolymarketctfSafeFactoryUpdated {
                            evt_tx_hash: Hex(&view.transaction.hash).to_string(),
                            evt_index: log.block_index,
                            evt_block_time: Some(blk.timestamp().to_owned()),
                            evt_block_number: blk.number,
                            new_safe_factory: event.new_safe_factory,
                            old_safe_factory: event.old_safe_factory,
                        });
                    }

                    None
                })
        })
        .collect());
    events.polymarketctf_token_registereds.append(&mut blk
        .receipts()
        .flat_map(|view| {
            view.receipt.logs.iter()
                .filter(|log| log.address == POLYMARKETCTF_TRACKED_CONTRACT)
                .filter_map(|log| {
                    if let Some(event) = abi::polymarketctf_contract::events::TokenRegistered::match_and_decode(log) {
                        return Some(contract::PolymarketctfTokenRegistered {
                            evt_tx_hash: Hex(&view.transaction.hash).to_string(),
                            evt_index: log.block_index,
                            evt_block_time: Some(blk.timestamp().to_owned()),
                            evt_block_number: blk.number,
                            condition_id: Vec::from(event.condition_id),
                            token0: event.token0.to_string(),
                            token1: event.token1.to_string(),
                        });
                    }

                    None
                })
        })
        .collect());
    events.polymarketctf_trading_pauseds.append(&mut blk
        .receipts()
        .flat_map(|view| {
            view.receipt.logs.iter()
                .filter(|log| log.address == POLYMARKETCTF_TRACKED_CONTRACT)
                .filter_map(|log| {
                    if let Some(event) = abi::polymarketctf_contract::events::TradingPaused::match_and_decode(log) {
                        return Some(contract::PolymarketctfTradingPaused {
                            evt_tx_hash: Hex(&view.transaction.hash).to_string(),
                            evt_index: log.block_index,
                            evt_block_time: Some(blk.timestamp().to_owned()),
                            evt_block_number: blk.number,
                            pauser: event.pauser,
                        });
                    }

                    None
                })
        })
        .collect());
    events.polymarketctf_trading_unpauseds.append(&mut blk
        .receipts()
        .flat_map(|view| {
            view.receipt.logs.iter()
                .filter(|log| log.address == POLYMARKETCTF_TRACKED_CONTRACT)
                .filter_map(|log| {
                    if let Some(event) = abi::polymarketctf_contract::events::TradingUnpaused::match_and_decode(log) {
                        return Some(contract::PolymarketctfTradingUnpaused {
                            evt_tx_hash: Hex(&view.transaction.hash).to_string(),
                            evt_index: log.block_index,
                            evt_block_time: Some(blk.timestamp().to_owned()),
                            evt_block_number: blk.number,
                            pauser: event.pauser,
                        });
                    }

                    None
                })
        })
        .collect());
}
fn map_polymarketctf_calls(blk: &eth::Block, calls: &mut contract::Calls) {
    calls.polymarketctf_call_add_admins.append(&mut blk
        .transactions()
        .flat_map(|tx| {
            tx.calls.iter()
                .filter(|call| call.address == POLYMARKETCTF_TRACKED_CONTRACT && abi::polymarketctf_contract::functions::AddAdmin::match_call(call))
                .filter_map(|call| {
                    match abi::polymarketctf_contract::functions::AddAdmin::decode(call) {
                        Ok(decoded_call) => {
                            Some(contract::PolymarketctfAddAdminCall {
                                call_tx_hash: Hex(&tx.hash).to_string(),
                                call_block_time: Some(blk.timestamp().to_owned()),
                                call_block_number: blk.number,
                                call_ordinal: call.begin_ordinal,
                                call_success: !call.state_reverted,
                                admin: decoded_call.admin,
                            })
                        },
                        Err(_) => None,
                    }
                })
        })
        .collect());
    calls.polymarketctf_call_add_operators.append(&mut blk
        .transactions()
        .flat_map(|tx| {
            tx.calls.iter()
                .filter(|call| call.address == POLYMARKETCTF_TRACKED_CONTRACT && abi::polymarketctf_contract::functions::AddOperator::match_call(call))
                .filter_map(|call| {
                    match abi::polymarketctf_contract::functions::AddOperator::decode(call) {
                        Ok(decoded_call) => {
                            Some(contract::PolymarketctfAddOperatorCall {
                                call_tx_hash: Hex(&tx.hash).to_string(),
                                call_block_time: Some(blk.timestamp().to_owned()),
                                call_block_number: blk.number,
                                call_ordinal: call.begin_ordinal,
                                call_success: !call.state_reverted,
                                operator: decoded_call.operator,
                            })
                        },
                        Err(_) => None,
                    }
                })
        })
        .collect());
    calls.polymarketctf_call_cancel_orders.append(&mut blk
        .transactions()
        .flat_map(|tx| {
            tx.calls.iter()
                .filter(|call| call.address == POLYMARKETCTF_TRACKED_CONTRACT && abi::polymarketctf_contract::functions::CancelOrder::match_call(call))
                .filter_map(|call| {
                    match abi::polymarketctf_contract::functions::CancelOrder::decode(call) {
                        Ok(decoded_call) => {
                            Some(contract::PolymarketctfCancelOrderCall {
                                call_tx_hash: Hex(&tx.hash).to_string(),
                                call_block_time: Some(blk.timestamp().to_owned()),
                                call_block_number: blk.number,
                                call_ordinal: call.begin_ordinal,
                                call_success: !call.state_reverted,
                            })
                        },
                        Err(_) => None,
                    }
                })
        })
        .collect());
    calls.polymarketctf_call_cancel_orders_batch.append(&mut blk
        .transactions()
        .flat_map(|tx| {
            tx.calls.iter()
                .filter(|call| call.address == POLYMARKETCTF_TRACKED_CONTRACT && abi::polymarketctf_contract::functions::CancelOrders::match_call(call))
                .filter_map(|call| {
                    match abi::polymarketctf_contract::functions::CancelOrders::decode(call) {
                        Ok(decoded_call) => {
                            Some(contract::PolymarketctfCancelOrdersCall {
                                call_tx_hash: Hex(&tx.hash).to_string(),
                                call_block_time: Some(blk.timestamp().to_owned()),
                                call_block_number: blk.number,
                                call_ordinal: call.begin_ordinal,
                                call_success: !call.state_reverted,
                            })
                        },
                        Err(_) => None,
                    }
                })
        })
        .collect());
    calls.polymarketctf_call_fill_orders.append(&mut blk
        .transactions()
        .flat_map(|tx| {
            tx.calls.iter()
                .filter(|call| call.address == POLYMARKETCTF_TRACKED_CONTRACT && abi::polymarketctf_contract::functions::FillOrder::match_call(call))
                .filter_map(|call| {
                    match abi::polymarketctf_contract::functions::FillOrder::decode(call) {
                        Ok(decoded_call) => {
                            Some(contract::PolymarketctfFillOrderCall {
                                call_tx_hash: Hex(&tx.hash).to_string(),
                                call_block_time: Some(blk.timestamp().to_owned()),
                                call_block_number: blk.number,
                                call_ordinal: call.begin_ordinal,
                                call_success: !call.state_reverted,
                                fill_amount: decoded_call.fill_amount.to_string(),
                            })
                        },
                        Err(_) => None,
                    }
                })
        })
        .collect());
    calls.polymarketctf_call_fill_orders_batch.append(&mut blk
        .transactions()
        .flat_map(|tx| {
            tx.calls.iter()
                .filter(|call| call.address == POLYMARKETCTF_TRACKED_CONTRACT && abi::polymarketctf_contract::functions::FillOrders::match_call(call))
                .filter_map(|call| {
                    match abi::polymarketctf_contract::functions::FillOrders::decode(call) {
                        Ok(decoded_call) => {
                            Some(contract::PolymarketctfFillOrdersCall {
                                call_tx_hash: Hex(&tx.hash).to_string(),
                                call_block_time: Some(blk.timestamp().to_owned()),
                                call_block_number: blk.number,
                                call_ordinal: call.begin_ordinal,
                                call_success: !call.state_reverted,
                                fill_amounts: decoded_call.fill_amounts.into_iter().map(|x| x.to_string()).collect::<Vec<_>>(),
                            })
                        },
                        Err(_) => None,
                    }
                })
        })
        .collect());
    calls.polymarketctf_call_increment_nonces.append(&mut blk
        .transactions()
        .flat_map(|tx| {
            tx.calls.iter()
                .filter(|call| call.address == POLYMARKETCTF_TRACKED_CONTRACT && abi::polymarketctf_contract::functions::IncrementNonce::match_call(call))
                .filter_map(|call| {
                    match abi::polymarketctf_contract::functions::IncrementNonce::decode(call) {
                        Ok(decoded_call) => {
                            Some(contract::PolymarketctfIncrementNonceCall {
                                call_tx_hash: Hex(&tx.hash).to_string(),
                                call_block_time: Some(blk.timestamp().to_owned()),
                                call_block_number: blk.number,
                                call_ordinal: call.begin_ordinal,
                                call_success: !call.state_reverted,
                            })
                        },
                        Err(_) => None,
                    }
                })
        })
        .collect());
    calls.polymarketctf_call_match_orders.append(&mut blk
        .transactions()
        .flat_map(|tx| {
            tx.calls.iter()
                .filter(|call| call.address == POLYMARKETCTF_TRACKED_CONTRACT && abi::polymarketctf_contract::functions::MatchOrders::match_call(call))
                .filter_map(|call| {
                    match abi::polymarketctf_contract::functions::MatchOrders::decode(call) {
                        Ok(decoded_call) => {
                            Some(contract::PolymarketctfMatchOrdersCall {
                                call_tx_hash: Hex(&tx.hash).to_string(),
                                call_block_time: Some(blk.timestamp().to_owned()),
                                call_block_number: blk.number,
                                call_ordinal: call.begin_ordinal,
                                call_success: !call.state_reverted,
                                maker_fill_amounts: decoded_call.maker_fill_amounts.into_iter().map(|x| x.to_string()).collect::<Vec<_>>(),
                                taker_fill_amount: decoded_call.taker_fill_amount.to_string(),
                            })
                        },
                        Err(_) => None,
                    }
                })
        })
        .collect());
    calls.polymarketctf_call_on_erc1155_batch_receiveds.append(&mut blk
        .transactions()
        .flat_map(|tx| {
            tx.calls.iter()
                .filter(|call| call.address == POLYMARKETCTF_TRACKED_CONTRACT && abi::polymarketctf_contract::functions::OnErc1155BatchReceived::match_call(call))
                .filter_map(|call| {
                    match abi::polymarketctf_contract::functions::OnErc1155BatchReceived::decode(call) {
                        Ok(decoded_call) => {
                            let output_param0 = match abi::polymarketctf_contract::functions::OnErc1155BatchReceived::output(&call.return_data) {
                                Ok(output_param0) => {output_param0}
                                Err(_) => Default::default(),
                            };
                            
                            Some(contract::PolymarketctfOnErc1155BatchReceivedCall {
                                call_tx_hash: Hex(&tx.hash).to_string(),
                                call_block_time: Some(blk.timestamp().to_owned()),
                                call_block_number: blk.number,
                                call_ordinal: call.begin_ordinal,
                                call_success: !call.state_reverted,
                                output_param0: Vec::from(output_param0),
                                param0: decoded_call.param0,
                                param1: decoded_call.param1,
                                param2: decoded_call.param2.into_iter().map(|x| x.to_string()).collect::<Vec<_>>(),
                                param3: decoded_call.param3.into_iter().map(|x| x.to_string()).collect::<Vec<_>>(),
                                param4: decoded_call.param4,
                            })
                        },
                        Err(_) => None,
                    }
                })
        })
        .collect());
    calls.polymarketctf_call_on_erc1155_receiveds.append(&mut blk
        .transactions()
        .flat_map(|tx| {
            tx.calls.iter()
                .filter(|call| call.address == POLYMARKETCTF_TRACKED_CONTRACT && abi::polymarketctf_contract::functions::OnErc1155Received::match_call(call))
                .filter_map(|call| {
                    match abi::polymarketctf_contract::functions::OnErc1155Received::decode(call) {
                        Ok(decoded_call) => {
                            let output_param0 = match abi::polymarketctf_contract::functions::OnErc1155Received::output(&call.return_data) {
                                Ok(output_param0) => {output_param0}
                                Err(_) => Default::default(),
                            };
                            
                            Some(contract::PolymarketctfOnErc1155ReceivedCall {
                                call_tx_hash: Hex(&tx.hash).to_string(),
                                call_block_time: Some(blk.timestamp().to_owned()),
                                call_block_number: blk.number,
                                call_ordinal: call.begin_ordinal,
                                call_success: !call.state_reverted,
                                output_param0: Vec::from(output_param0),
                                param0: decoded_call.param0,
                                param1: decoded_call.param1,
                                param2: decoded_call.param2.to_string(),
                                param3: decoded_call.param3.to_string(),
                                param4: decoded_call.param4,
                            })
                        },
                        Err(_) => None,
                    }
                })
        })
        .collect());
    calls.polymarketctf_call_pause_tradings.append(&mut blk
        .transactions()
        .flat_map(|tx| {
            tx.calls.iter()
                .filter(|call| call.address == POLYMARKETCTF_TRACKED_CONTRACT && abi::polymarketctf_contract::functions::PauseTrading::match_call(call))
                .filter_map(|call| {
                    match abi::polymarketctf_contract::functions::PauseTrading::decode(call) {
                        Ok(decoded_call) => {
                            Some(contract::PolymarketctfPauseTradingCall {
                                call_tx_hash: Hex(&tx.hash).to_string(),
                                call_block_time: Some(blk.timestamp().to_owned()),
                                call_block_number: blk.number,
                                call_ordinal: call.begin_ordinal,
                                call_success: !call.state_reverted,
                            })
                        },
                        Err(_) => None,
                    }
                })
        })
        .collect());
    calls.polymarketctf_call_register_tokens.append(&mut blk
        .transactions()
        .flat_map(|tx| {
            tx.calls.iter()
                .filter(|call| call.address == POLYMARKETCTF_TRACKED_CONTRACT && abi::polymarketctf_contract::functions::RegisterToken::match_call(call))
                .filter_map(|call| {
                    match abi::polymarketctf_contract::functions::RegisterToken::decode(call) {
                        Ok(decoded_call) => {
                            Some(contract::PolymarketctfRegisterTokenCall {
                                call_tx_hash: Hex(&tx.hash).to_string(),
                                call_block_time: Some(blk.timestamp().to_owned()),
                                call_block_number: blk.number,
                                call_ordinal: call.begin_ordinal,
                                call_success: !call.state_reverted,
                                complement: decoded_call.complement.to_string(),
                                condition_id: Vec::from(decoded_call.condition_id),
                                token: decoded_call.token.to_string(),
                            })
                        },
                        Err(_) => None,
                    }
                })
        })
        .collect());
    calls.polymarketctf_call_remove_admins.append(&mut blk
        .transactions()
        .flat_map(|tx| {
            tx.calls.iter()
                .filter(|call| call.address == POLYMARKETCTF_TRACKED_CONTRACT && abi::polymarketctf_contract::functions::RemoveAdmin::match_call(call))
                .filter_map(|call| {
                    match abi::polymarketctf_contract::functions::RemoveAdmin::decode(call) {
                        Ok(decoded_call) => {
                            Some(contract::PolymarketctfRemoveAdminCall {
                                call_tx_hash: Hex(&tx.hash).to_string(),
                                call_block_time: Some(blk.timestamp().to_owned()),
                                call_block_number: blk.number,
                                call_ordinal: call.begin_ordinal,
                                call_success: !call.state_reverted,
                                admin: decoded_call.admin,
                            })
                        },
                        Err(_) => None,
                    }
                })
        })
        .collect());
    calls.polymarketctf_call_remove_operators.append(&mut blk
        .transactions()
        .flat_map(|tx| {
            tx.calls.iter()
                .filter(|call| call.address == POLYMARKETCTF_TRACKED_CONTRACT && abi::polymarketctf_contract::functions::RemoveOperator::match_call(call))
                .filter_map(|call| {
                    match abi::polymarketctf_contract::functions::RemoveOperator::decode(call) {
                        Ok(decoded_call) => {
                            Some(contract::PolymarketctfRemoveOperatorCall {
                                call_tx_hash: Hex(&tx.hash).to_string(),
                                call_block_time: Some(blk.timestamp().to_owned()),
                                call_block_number: blk.number,
                                call_ordinal: call.begin_ordinal,
                                call_success: !call.state_reverted,
                                operator: decoded_call.operator,
                            })
                        },
                        Err(_) => None,
                    }
                })
        })
        .collect());
    calls.polymarketctf_call_renounce_admin_roles.append(&mut blk
        .transactions()
        .flat_map(|tx| {
            tx.calls.iter()
                .filter(|call| call.address == POLYMARKETCTF_TRACKED_CONTRACT && abi::polymarketctf_contract::functions::RenounceAdminRole::match_call(call))
                .filter_map(|call| {
                    match abi::polymarketctf_contract::functions::RenounceAdminRole::decode(call) {
                        Ok(decoded_call) => {
                            Some(contract::PolymarketctfRenounceAdminRoleCall {
                                call_tx_hash: Hex(&tx.hash).to_string(),
                                call_block_time: Some(blk.timestamp().to_owned()),
                                call_block_number: blk.number,
                                call_ordinal: call.begin_ordinal,
                                call_success: !call.state_reverted,
                            })
                        },
                        Err(_) => None,
                    }
                })
        })
        .collect());
    calls.polymarketctf_call_renounce_operator_roles.append(&mut blk
        .transactions()
        .flat_map(|tx| {
            tx.calls.iter()
                .filter(|call| call.address == POLYMARKETCTF_TRACKED_CONTRACT && abi::polymarketctf_contract::functions::RenounceOperatorRole::match_call(call))
                .filter_map(|call| {
                    match abi::polymarketctf_contract::functions::RenounceOperatorRole::decode(call) {
                        Ok(decoded_call) => {
                            Some(contract::PolymarketctfRenounceOperatorRoleCall {
                                call_tx_hash: Hex(&tx.hash).to_string(),
                                call_block_time: Some(blk.timestamp().to_owned()),
                                call_block_number: blk.number,
                                call_ordinal: call.begin_ordinal,
                                call_success: !call.state_reverted,
                            })
                        },
                        Err(_) => None,
                    }
                })
        })
        .collect());
    calls.polymarketctf_call_set_proxy_factories.append(&mut blk
        .transactions()
        .flat_map(|tx| {
            tx.calls.iter()
                .filter(|call| call.address == POLYMARKETCTF_TRACKED_CONTRACT && abi::polymarketctf_contract::functions::SetProxyFactory::match_call(call))
                .filter_map(|call| {
                    match abi::polymarketctf_contract::functions::SetProxyFactory::decode(call) {
                        Ok(decoded_call) => {
                            Some(contract::PolymarketctfSetProxyFactoryCall {
                                call_tx_hash: Hex(&tx.hash).to_string(),
                                call_block_time: Some(blk.timestamp().to_owned()),
                                call_block_number: blk.number,
                                call_ordinal: call.begin_ordinal,
                                call_success: !call.state_reverted,
                                u_new_proxy_factory: decoded_call.u_new_proxy_factory,
                            })
                        },
                        Err(_) => None,
                    }
                })
        })
        .collect());
    calls.polymarketctf_call_set_safe_factories.append(&mut blk
        .transactions()
        .flat_map(|tx| {
            tx.calls.iter()
                .filter(|call| call.address == POLYMARKETCTF_TRACKED_CONTRACT && abi::polymarketctf_contract::functions::SetSafeFactory::match_call(call))
                .filter_map(|call| {
                    match abi::polymarketctf_contract::functions::SetSafeFactory::decode(call) {
                        Ok(decoded_call) => {
                            Some(contract::PolymarketctfSetSafeFactoryCall {
                                call_tx_hash: Hex(&tx.hash).to_string(),
                                call_block_time: Some(blk.timestamp().to_owned()),
                                call_block_number: blk.number,
                                call_ordinal: call.begin_ordinal,
                                call_success: !call.state_reverted,
                                u_new_safe_factory: decoded_call.u_new_safe_factory,
                            })
                        },
                        Err(_) => None,
                    }
                })
        })
        .collect());
    calls.polymarketctf_call_unpause_tradings.append(&mut blk
        .transactions()
        .flat_map(|tx| {
            tx.calls.iter()
                .filter(|call| call.address == POLYMARKETCTF_TRACKED_CONTRACT && abi::polymarketctf_contract::functions::UnpauseTrading::match_call(call))
                .filter_map(|call| {
                    match abi::polymarketctf_contract::functions::UnpauseTrading::decode(call) {
                        Ok(decoded_call) => {
                            Some(contract::PolymarketctfUnpauseTradingCall {
                                call_tx_hash: Hex(&tx.hash).to_string(),
                                call_block_time: Some(blk.timestamp().to_owned()),
                                call_block_number: blk.number,
                                call_ordinal: call.begin_ordinal,
                                call_success: !call.state_reverted,
                            })
                        },
                        Err(_) => None,
                    }
                })
        })
        .collect());
}

#[substreams::handlers::map]
fn map_events_calls(
    events: contract::Events,
    calls: contract::Calls,
) -> Result<contract::EventsCalls, substreams::errors::Error> {
    Ok(contract::EventsCalls {
        events: Some(events),
        calls: Some(calls),
    })
}
#[substreams::handlers::map]
fn map_events(blk: eth::Block) -> Result<contract::Events, substreams::errors::Error> {
    let mut events = contract::Events::default();
    map_polymarketctf_events(&blk, &mut events);
    Ok(events)
}
#[substreams::handlers::map]
fn map_calls(blk: eth::Block) -> Result<contract::Calls, substreams::errors::Error> {
let mut calls = contract::Calls::default();
    map_polymarketctf_calls(&blk, &mut calls);
    Ok(calls)
}

