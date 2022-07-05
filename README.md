# erc20-ico
Implementation of [ERC20]("https://github.com/ethereum/EIPs/blob/master/EIPS/eip-20.md") token together with initial coin offering functionality written in hardhat environment.

- ICO is a Smart Contract that accepts ETH in exchange for PJZV token
- The PJZV token is a fully compliant ERC20 token and will be generated at the ICO time
- Investors will send ETH to the ICO contract's address and in return they will receive PJZV tokens
- There is deposit address (EOA account) that automatically receives the ETH sent to the ICO contract
- PJZV token price in wei is: 1 PJZV = 0.001 ETH = 10**15 wei, 1 ETH = 1000 PJZV
- The minimum investment is 0.001 ETH and the maximum investment is 5 ETH
- Single address can invest up to 5 ETH 
- The ICO Hardcap is 300 ETH
- The ICO will have an admin that specifies when the ICO starts and ends
- The ICO ends when the Hardcap is reached or the end time is reached
- The PJZV token will be tradeable only after a specific time set by the admin
- In case of emergency the admin could stop the ICO and could also change the deposit address in case it gets compromised
- Remaining (not sold) tokens can be burn after the ICO ends 
