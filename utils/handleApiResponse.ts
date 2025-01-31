type ChatItem = {
    id: string
    content: string
    role: "user" | "assistant"
    timestamp: number
    imageUrl?: string
    type?: "swap" | "vision" | "getDLMM" | "createPosition" | "activePositions" | "removeLiquidity" | "fetchLSTS"
    props?: any
  }


  interface ApiResponse {
    result?: string
    content?: string
    toolResponses?: Array<{
      tool: string
      response: string
    }>
  }
  
  interface ProcessedResponse {
    responseText?: string
    responseComponent?: ChatItem
  }
  
  export function handleApiResponse(responseData: ApiResponse): ProcessedResponse {
    const processedResponse: ProcessedResponse = {}
  
    // Handle text response
    if (responseData.result || responseData.content) {
      processedResponse.responseText = responseData.result || responseData.content
    }
    
    // Handle tool responses
    if (responseData.toolResponses && responseData.toolResponses.length > 0) {
      const toolResponse = responseData.toolResponses[0]
      try {
        const parsedToolResponse = JSON.parse(toolResponse.response)
        const tool = toolResponse.tool
  
        if (tool === "requestSwapQuote") {
          processedResponse.responseComponent = {
            id: Date.now().toString(),
            role: "assistant",
            timestamp: Date.now(),
            type: "swap",
            props: parsedToolResponse,
            content: "",
          }
        }
        else if (tool === 'addLiquidity' ){
            processedResponse.responseComponent = {
                id: Date.now().toString(),
            role: "assistant",
            timestamp: Date.now(),
            type: "getDLMM",
            props: parsedToolResponse,
            content: "",
            }
        }

        else if (tool === "superLiquidityManager"){
            processedResponse.responseComponent = {
                id: Date.now().toString(),
            role: "assistant",
            timestamp: Date.now(),
            type: "createPosition",
            props: parsedToolResponse,
            content: "",
            }
        }

        else if (tool === "removeLiquidity" ){
            processedResponse.responseComponent = {
                id: Date.now().toString(),
            role: "assistant",
            timestamp: Date.now(),
            type: "activePositions",
            props: parsedToolResponse,
            content: "",
            }
        }
        else if (tool === "superLiquidityRemover"){
            processedResponse.responseComponent = {
                id: Date.now().toString(),
            role: "assistant",
            timestamp: Date.now(),
            type: "removeLiquidity",
            props: parsedToolResponse,
            content: "",
            }
        }
        else if (tool === "showActivePositions"){
            processedResponse.responseComponent = {
                id: Date.now().toString(),
            role: "assistant",
            timestamp: Date.now(),
            type: "activePositions",
            props: parsedToolResponse,
            content: "",
            }
        }
        else if (tool === "getLiquidityPool"){
            processedResponse.responseComponent = {
                id: Date.now().toString(),
            role: "assistant",
            timestamp: Date.now(),
            type: "getDLMM",
            props: parsedToolResponse,
            content: "",
            }
        }
        else if (tool === "fetchLstsInfo"){
            processedResponse.responseComponent = {
                id: Date.now().toString(),
            role: "assistant",
            timestamp: Date.now(),
            type: "fetchLSTS",
            props: parsedToolResponse,
            content: "",
            }
        }
        else if (tool === "superStakeExecuter"){
            processedResponse.responseComponent = {
                id: Date.now().toString(),
            role: "assistant",
            timestamp: Date.now(),
            type: "swap",
            props: parsedToolResponse,
            content: "",
            }
        }




        }
        
        
        
        catch (error) {
        console.error("Failed to parse tool response:", error)
      }
    }
  
    // Handle vision analysis response
    if (responseData.content && typeof responseData.content === "string") {
      processedResponse.responseComponent = {
        id: Date.now().toString(),
        role: "assistant",
        timestamp: Date.now(),
        type: "vision",
        props: { content: responseData.content },
        content: "",
      }
    }
  
    return processedResponse
  }