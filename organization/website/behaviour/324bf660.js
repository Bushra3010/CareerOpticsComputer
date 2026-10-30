
        tailwind.config = {
            theme: {
                extend: {
                    animation: {
                        float: "float 5s ease-in-out infinite",
                    },
                    keyframes: {
                        float: {
                            "0%, 100%": {
                                transform: "translateY(0px)"
                            },
                            "50%": {
                                transform: "translateY(-12px)"
                            }
                        }
                    }
                }
            }
        }
    