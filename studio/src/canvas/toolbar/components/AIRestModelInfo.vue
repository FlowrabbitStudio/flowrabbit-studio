<template>
    <div class="MatcAlertBox MatcMarginBottom MatcAlertBoxInfo">
        <span class="MatcAlertBoxContent">
            Info: Remaining Flowrabbit credits.
        </span>
        <div class="MatcFlex MatcEnd">
            <span class="icon coins-icon"></span><span class="ml-2 mr-2">{{ credits }}</span>
        </div>
    </div>
</template>

<script>
export default {
    props: ['credits']
};
</script>
