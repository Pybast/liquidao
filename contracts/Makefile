# Makefile

ifneq (,$(wildcard ./.env))
    include .env
    export $(shell sed 's/=.*//' .env)
endif

CONTRACTS_DIR = ./out
CONTRACTS = LiquiDAOHook
FRONTEND_ABI_DIR = ../frontend/hooks/gated-pool/abis

.DEFAULT_GOAL := help

# 3) Foundry commands
build: ## Build the contracts
	@forge build

tests: ## Run tests
	@forge test --gas-report

coverage: ## Run coverage
	@forge coverage

clean: ## Remove artifacts (build cache, etc.)
	@rm -rf out
	@rm -rf cache

copy: build
	@echo "Copying ABI..."
	@for contract in $(CONTRACTS); do \
    	cp $(CONTRACTS_DIR)/$$contract.sol/$$contract.json $(FRONTEND_ABI_DIR); \
	done
	@echo "ABI files copied successfully!"

mock-deploy: ## Deploy contract(s) to the specified network without broadcasting
	@forge script script/Deploy.s.sol \
		--rpc-url $(RPC_URL) \
		--private-key $(PRIVATE_KEY) \
		-vvvvv

deploy: ## Deploy contract(s) to the specified network
	@forge script script/Deploy.s.sol \
		--rpc-url $(RPC_URL) \
		--private-key $(PRIVATE_KEY) \
		--broadcast \
		--verify \
		--verifier blockscout \
		--verifier-url https://eth-sepolia.blockscout.com/api/

verify:
	@forge verify-contract \
		--rpc-url $(RPC_URL) \
		"0x420A8B620D23c2990f797Bbf8E4da06EDE468080,0x975EBCfB9DF15A074E3d3600D418E46fB5C3629C" \
		./src/LiquiDAOHook.sol:LiquiDAOHook \
		--constructor-args $(POOL_MANAGER_ADDRESS) \
		--verifier blockscout \
		--verifier-url https://eth-sepolia.blockscout.com/api/

help: ## Show available Make targets
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@awk 'BEGIN {FS = ":.*##"; printf "\n"} /^[a-zA-Z0-9\-_]+:.*?##/ \
		{ printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2 }' $(MAKEFILE_LIST)
