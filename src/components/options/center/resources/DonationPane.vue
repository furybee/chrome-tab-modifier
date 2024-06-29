<template>
	<div class="container mx-auto max-w-5xl p-4">
		<div class="card bg-base-200 mb-4">
			<div class="card-body">
				<h2 class="card-title">
					{{ $translate('donation_title') }}
				</h2>
				<p>
					{{ $translate('donation_subtitle') }}
				</p>
			</div>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-3 gap-2 text-md">
			<DonationCard link="https://www.buymeacoffee.com/xyugxh7bk" name="Buy Me a Coffee">
				<template #icon>
					<BuyMeACoffeeIcon class="!h-4" />
				</template>
			</DonationCard>
			<DonationCard link="https://donate.stripe.com/fZeg1Sgml971dbieUU" name="Credit Card">
				<template #icon>
					<DonationIcon class="!h-4 text-black" />
				</template>
			</DonationCard>
			<DonationCard
				link="https://www.paypal.com/donate/?hosted_button_id=T7KZA4MLT5XTU"
				name="Paypal"
			>
				<template #icon>
					<PayPalIcon class="!h-4" />
				</template>
			</DonationCard>
		</div>
	</div>
</template>

<script lang="ts" setup>
import BuyMeACoffeeIcon from '../../../global/donations/BuyMeACoffeeIcon.vue';
import DonationIcon from '../../../icons/DonationIcon.vue';
import PayPalIcon from '../../../global/donations/PayPalIcon.vue';
import DonationCard from './DonationCard.vue';
</script>

<style scoped></style>
