const calculator = document.querySelector('.calculator')
const keys = calculator.querySelector('.calculator__keys')
const display = document.querySelector('.calculator__display')


keys.addEventListener('click', e => {

  //for when a user clicks any button on the calculator .. may split this up
  if (e.target.matches('button')) {
    const key = e.target
    const action = key.dataset.action
    const keyContent = key.textContent
    const displayedNum = display.textContent
    const previousKeyType = calculator.dataset.previousKeyType
    const previousAns = calculator.dataset.previousAns

    //for updating the display
    if (!action) {
      if (displayedNum === '0' || previousKeyType === 'operator' || previousKeyType === 'calculate') {
        display.textContent = keyContent
      } else {
        display.textContent = displayedNum + keyContent
      }
      console.log('number key!')
      calculator.dataset.previousKeyType = 'number'
    }

    if (
      action === 'add' ||
      action === 'subtract' ||
      action === 'multiply' ||
      action === 'divide'
    ) {
      console.log('operator key!')
      key.classList.add('is-depressed')

      calculator.dataset.firstValue = displayedNum
      calculator.dataset.operator = action
      calculator.dataset.previousKeyType = 'operator'
    }

    if (action === 'decimal') {
      if (!displayedNum.includes('.')) {
        display.textContent = displayedNum + '.'
      } else if (previousKeyType === 'operator'){
        display.textContent = '0.'
      }
      calculator.dataset.previousKeyType = 'decimal'
    }

    if (action === 'clear') {
      console.log('clear key!')

      display.textContent = '0'
      calculator.dataset.previousKeyType = 'clear'
    }

    if (action === 'calculate') {
      const firstValue = calculator.dataset.firstValue
      const operator = calculator.dataset.operator
      const secondValue = displayedNum

      display.textContent = calculate(firstValue, operator, secondValue)

      calculator.dataset.previousKeyType = 'calculate'
      calculator.dataset.previousAns = display.textContent

      console.log('equal key!')
    }

    if (action === 'previous_ans'){
      display.textContent = calculator.dataset.previousAns
      console.log('previous ans!')
    }

    //undepress all depressed keys
    Array.from(key.parentNode.children)
      .forEach(k => k.classList.remove('is-depressed'))

  }
}) //end buttonEventListener


//inline function for calculations done by the calculator
const calculate = (n1, operator, n2) => {
  let result = ''

  if (operator === 'add') {
    result = parseFloat(n1) + parseFloat(n2)
  } else if (operator === 'subtract') {
    result = parseFloat(n1) - parseFloat(n2)
  } else if (operator === 'multiply') {
    result = parseFloat(n1) * parseFloat(n2)
  } else if (operator === 'divide') {
    result = parseFloat(n1) / parseFloat(n2)
  }

  return result
}
