import { SubstrateEvent } from "@subql/types";
import { WasmEvent } from "@subql/substrate-wasm-processor";
import { Codec } from '@polkadot/types-codec/types';
import type { UInt, u16, u32, u64, u8 } from '@polkadot/types-codec';
import { Balance, AccountId } from "@polkadot/types/interfaces";

import {
	Account,
	Stake,
	DeveloperReward,
	DappStakingEra,
	PalletInfo,
	RaffleDone,
	Reward,
	RewardsClaimed
} from "../types";

const DAPPSTAKING_CONTRACT_ID = process.env.DAPPSTAKING_CONTRACT_ID as string;
const DAPPSTAKING_DEVELOPER_ID = process.env.DAPPSTAKING_DEVELOPER_ID as string;


async function getCurrentEra(): Promise<bigint> {
	let currentEra = BigInt(0);
    let palletInfo = await PalletInfo.get('0');
    if (palletInfo) {
		currentEra = palletInfo.currentEra;
    }
	return currentEra;
}

async function getAccount(accountId: string): Promise<Account> {
    let userAccount = await Account.get(accountId);
    if (!userAccount) {
		userAccount = new Account(accountId, BigInt(0), BigInt(0), BigInt(0), BigInt(0));
    }
	return userAccount;
}

async function toBigInt(value: Codec): Promise<bigint> {
	return BigInt(value.toString());
}

export async function bondAndStake(event: SubstrateEvent): Promise<void> {
    const {
        event: {
            data: [account, smartContract, balanceOf],
        },
    } = event;

    if (!smartContract.toString().includes(DAPPSTAKING_CONTRACT_ID)){
		return;
    }

    await logger.info("---------- DappsStaking - BondAndStake --------- ");

    const amount = (balanceOf as Balance).toBigInt();

    let userAccount = await getAccount(account.toString());
	userAccount.totalStake += amount;
	await userAccount.save();

	const currentEra = await getCurrentEra();
	let stake = new Stake(
		`${event.block.block.header.number.toNumber()}-${event.idx}`,
		userAccount.id,
		amount,
		currentEra,
		event.block.block.header.number.toBigInt()
	);
	await stake.save();

}


export async function unbondAndUnstake(event: SubstrateEvent): Promise<void> {
    const {
        event: {
            data: [account, smartContract, balanceOf],
        },
    } = event;

    if (!smartContract.toString().includes(DAPPSTAKING_CONTRACT_ID)){
		return;
    }

	await logger.info("---------- DappsStaking - UnbondAndUnstake --------- ");

    const amount = (balanceOf as Balance).toBigInt();

    let userAccount = await getAccount(account.toString());
	userAccount.totalStake -= amount;
	await userAccount.save();

	const currentEra = await getCurrentEra();
	let stake = new Stake(
		`${event.block.block.header.number.toNumber()}-${event.idx}`,
		userAccount.id,
		-amount,
		currentEra,
		event.block.block.header.number.toBigInt()
	);

	await stake.save();
}


export async function nominationTransfer(event: SubstrateEvent): Promise<void> {
    const {
        event: {
            data: [account, originSmartContract, balanceOf, targetSmartContract],
        },
    } = event;

    if (!originSmartContract.toString().includes(DAPPSTAKING_CONTRACT_ID)
		&& !targetSmartContract.toString().includes(DAPPSTAKING_CONTRACT_ID)
	){
		return;
    }

    let userAccount = await getAccount(account.toString());

	const amount = (balanceOf as Balance).toBigInt();
	const currentEra = await getCurrentEra();

    if (targetSmartContract.toString().includes(DAPPSTAKING_CONTRACT_ID)){
    	await logger.info("---------- DappsStaking - nominationTransferIn --------- ");

		userAccount.totalStake += amount;
		await userAccount.save();

		let stake = new Stake(
			`${event.block.block.header.number.toNumber()}-${event.idx}`,
			userAccount.id,
			amount,
			currentEra,
			event.block.block.header.number.toBigInt()
		);
		await stake.save();

    } else if (originSmartContract.toString().includes(DAPPSTAKING_CONTRACT_ID)){
    	await logger.info("---------- DappsStaking - nominationTransferOut --------- ");

		userAccount.totalStake -= amount;
		await userAccount.save();

		let stake = new Stake(
			`${event.block.block.header.number.toNumber()}-${event.idx}`,
			userAccount.id,
			-amount,
			currentEra,
			event.block.block.header.number.toBigInt()
		);
		await stake.save();

    } else {
    	await logger.info("---------- DappsStaking - nominationTransfer ERROR --------- ");
    	await logger.info(event.block.block.header.hash.toString());
	}
}


export async function reward(event: SubstrateEvent): Promise<void> {
    const {
        event: {
            data: [account, smartContract, era, balanceOf],
        },
    } = event;

    if (!smartContract.toString().includes(DAPPSTAKING_CONTRACT_ID)){
		return;
    }

	if (!account.toString().includes(DAPPSTAKING_DEVELOPER_ID)){
		return;
    }

    await logger.info("---------- DappsStaking - Reward --------- ");

	/* save the developer account the first time to avoid an error with FK */
    let developerAccount = await Account.get(account.toString());
    if (!developerAccount) {
		developerAccount = new Account(account.toString(), BigInt(0), BigInt(0), BigInt(0), BigInt(0));
		await developerAccount.save();
    }

    const amount = (balanceOf as Balance).toBigInt();
	const bi_era = await toBigInt(era);

	let reward = new DeveloperReward(
		`${event.block.block.header.number.toNumber()}-${event.idx}`,
		bi_era,
		developerAccount.id,
		amount
	);
	await reward.save();
}

export async function newDappStakingEra(event: SubstrateEvent): Promise<void> {
    const {
        event: {
            data: [era],
        },
    } = event;

    await logger.info("---------- DappsStaking - New DappStaking Era --------- ");
	await logger.info(DAPPSTAKING_CONTRACT_ID);
	await logger.info(DAPPSTAKING_DEVELOPER_ID);

	const newEra = await toBigInt(era);
	let dappStakingEra = new DappStakingEra(
		`${event.block.block.header.number.toNumber()}-${event.idx}`,
		newEra,
		event.block.block.header.number.toBigInt()
	);
	await dappStakingEra.save();

    let palletInfo = await PalletInfo.get('0');
    if (!palletInfo) {
		palletInfo = new PalletInfo('0', newEra);
    } else {
		palletInfo.currentEra = newEra;
	}
	await palletInfo.save();

}


type RaffleDoneEvent = [AccountId, UInt, Balance, UInt, UInt, Balance] & {
	contract: AccountId,
	era: UInt,
	pendingRewards: Balance,
	nbWinners: UInt,
	nbParticipants: UInt,
	totalValue: Balance,
}

export async function raffleDone(event: WasmEvent<RaffleDoneEvent>): Promise<void> {

    await logger.info("---------- Raffle Done  --------- ");

	const [contract, era, pendingRewards, nbWinners, nbParticipants, totalValue] = event.args;

	let raffleDone = new RaffleDone(
		`${event.blockNumber.valueOf()}-${event.eventIndex.valueOf()}`,
		era.toBigInt(),
		pendingRewards.toBigInt(),
		nbWinners.toBigInt(),
		nbParticipants.toBigInt(),
		totalValue.toBigInt(),
	);
	await raffleDone.save();

}


type PendingRewardEvent = [AccountId, UInt, Balance] & {
	account: AccountId,
	era: UInt,
	amount: Balance,
}

export async function pendingReward(event: WasmEvent<PendingRewardEvent>): Promise<void> {

    await logger.info("---------- Pending Reward --------- ");

	const [account, era, amount] = event.args;

    let userAccount = await getAccount(account.toString());
	userAccount.totalRewards += amount.toBigInt();
	userAccount.totalPending += amount.toBigInt();
	await userAccount.save();

	let reward = new Reward(
		`${event.blockNumber.valueOf()}-${event.eventIndex.valueOf()}`,
		userAccount.id,
		era.toBigInt(),
		amount.toBigInt()
	);
	await reward.save();

}


type RewardsClaimedEvent = [AccountId, Balance] & {
	account: AccountId,
	amount: Balance,
}

export async function rewardsClaimed(event: WasmEvent<RewardsClaimedEvent>): Promise<void> {

    await logger.info("---------- Rewards Claimed --------- ");

	const [account, amount] = event.args;

    let userAccount = await getAccount(account.toString());
	userAccount.totalClaimed += amount.toBigInt();
	userAccount.totalPending -= amount.toBigInt();
	await userAccount.save();

	let rewardsClaimed = new RewardsClaimed(
		`${event.blockNumber.valueOf()}-${event.eventIndex.valueOf()}`,
		userAccount.id,
		amount.toBigInt()
	);
	await rewardsClaimed.save();

}