
import {   VersionedTransaction } from '@solana/web3.js'



import {  useAppKitProvider   } from '@reown/appkit/react'
import type {  Provider } from '@reown/appkit-adapter-solana/react'
import { Button } from '@/components/ui/button'


export function SwapExecutor(swapData) {
//  console.log("🚀 ~ SwapExecutor ~ swapData", swapData)
// const swapTransaction = 'AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAQAGDPiXdkM8DtfCAZZVhKWVnT47Aq9RYsxCY4ytRTNnmMPeP+SdQpAnLcWyBZAFScDKfUYeMFd8iAoFlp7o5qmAGqBBzHkcBs64pqCToxUtmGZy+ahjuyNBvGZ2VJBOoKpqmk+GzIGXzG5tL/VAiBJjIbfo4lcvOUN2T56/DdwtVDvwf4OWiVA1LWaq3h2SgcgXdbj9SjOnfDNTkpKvX0prdhWbuHJwAcO3BdYmhyPvEX8SmgU8dVQCREOvDmHI9ZKQIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwZGb+UhFzL/7K26csOb57yM5bvF9xJrLEObOkAAAAAEedVb8jHAbu50xW7OaBUH/bGy3qP0jlECsc2iVrwTjwbd9uHXZaGT2cvhRs7reawctIXtX1s3kTqM9YV+/wCpjJclj04kifG7PRApFI4NgwtaE5na/xCEBI572Nvp+Fm0P/on9df2SnTAmx8pWHneSwmrNt/J3VFLMhqns4zl6BkTejJ4Zhk6CEJxsSaSciog5hO9B7s3N9mBJ6slD9vqBgcABQLAXBUACgYAAQARBgkBAQYCAAEMAgAAAEBCDwAAAAAACQEBAREIHQkAAQQIEwgLCBAMEA0PAQQREw4QAAkJEhAFAgMII+UXy5d6460qAQAAACZkAAFAQg8AAAAAAA0QAwAAAAAA9AEACQMBAAABCQHd+CyZR5LZUmyV4nOzZRo3NOUrU5S0Vl7VIaW+dhUbWAQjIiYgBCEfKCU='
const swapTransaction = swapData.swapTransaction

const { walletProvider } = useAppKitProvider<Provider>('solana')
  async function executeSwap() {
   
    try {
     

      const swapTransactionBuf = Buffer.from(swapTransaction, 'base64');
      const deserializedTx = VersionedTransaction.deserialize(swapTransactionBuf);

    const result = await walletProvider.signAndSendTransaction(
      deserializedTx);
    console.log("🚀 ~ executeSwap ~ result:", result)


    return result
    } catch (error) {
      console.error('Error executing swap:', error)
      setError('Failed to execute swap. Please try again.')
    } finally {
    
    }
  }
  
  return(
    <>
    <div>
    <Button className="w-full bg-purple-500 hover:bg-purple-600 text-white py-6 text-lg mt-4"
            onClick={() => executeSwap()}
            >
              Swap
            </Button>
            
    </div>
    
    </>
  )
 
}