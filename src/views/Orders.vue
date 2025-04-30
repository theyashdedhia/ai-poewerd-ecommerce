<template>
    <div class="orders">
        <h1>Orders</h1>
        <div v-if="orders.length">
            <ul>
                <li v-for="order in orders" :key="order.id">
                    <p>Order ID: {{ order.id }}</p>
                    <p>Customer: {{ order.customer }}</p>
                    <p>Total: {{ order.total }}</p>
                </li>
            </ul>
        </div>
        <div v-else>
            <p>No orders available.</p>
        </div>
    </div>
</template>

<script>
export default {
    name: "Orders",
    data() {
        return {
            orders: [
                { id: 1, customer: "John Doe", total: "$100" },
                { id: 2, customer: "Jane Smith", total: "$200" },
            ],
        };
    },
};
</script>

<style scoped>
.orders {
    padding: 20px;
}

.orders h1 {
    font-size: 24px;
    margin-bottom: 20px;
}

.orders ul {
    list-style: none;
    padding: 0;
}

.orders li {
    border: 1px solid #ccc;
    padding: 10px;
    margin-bottom: 10px;
}
</style>