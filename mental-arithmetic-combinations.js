function generateCombinations() {
  questionPool = [];
  questionPool2 = [];
  questionPool3 = [];
  questionPool4 = []
  remainder = 0;
  /*ADDITION*/
  if (controller.modeChoice === 'sudetis') {
    if (controller.modeChoice2 === 'viena10') {
      if (controller.modeChoice3 === 'neper') {
        for (let number1 = 1; number1 <= 9; number1++) {
          for (let number2 = 1; number2 <= 9; number2++) {
             if (number1 + number2 <= 10) {
              questionPool.push([parseInt(number1), parseInt(number2), "addition"]);
            }
          }
        }
        controller.combinations = questionPool.sort(() => 0.5 - Math.random()).slice(0, 20);
      }
    } else if (controller.modeChoice2 === 'viena') {
      if (controller.modeChoice3 === 'neper') {
        for (let number1 = 1; number1 <= 9; number1++) {
          for (let number2 = 1; number2 <= 9; number2++) {
            if (11 <= number1 + number2 && number1 + number2 <= 19) {
              questionPool.push([parseInt(number1), parseInt(number2), "addition"]);
            }
          }
        }
          controller.combinations = questionPool.sort(() => 0.5 - Math.random()).slice(0, 20);
      }
    } else if (controller.modeChoice2 === 'dvivien20') {
      if (controller.modeChoice3 === 'neper') {
          for (let number1 = 10; number1 <= 19; number1++) {
            for (let number2 = 1; number2 <= 9; number2++) {
              if (number1 + number2 <= 20) {
                questionPool.push([parseInt(number1), parseInt(number2), "addition"]);
              }
            }
          }
          controller.combinations = questionPool.sort(() => 0.5 - Math.random()).slice(0, 20);
        }
      } else if (controller.modeChoice2 === 'dvivien') {
        if (controller.modeChoice3 === 'neper') {
            for (let number1 = 10; number1 <= 99; number1++) {
              for (let number2 = 1; number2 <= 9; number2++) {
                if (parseInt(number1.toString()[1]) + number2 < 10 && number1 + number2 < 100) {
                  questionPool.push([parseInt(number1), parseInt(number2), "addition"]);
                }
              }
            }
          } else if (controller.modeChoice3 === 'per10') {
            for (let number1 = 10; number1 <= 99; number1++) {
              for (let number2 = 1; number2 <= 9; number2++) {
                if (parseInt(number1.toString()[1]) + number2 > 10 && number1 + number2 < 100) {
                  questionPool.push([parseInt(number1), parseInt(number2), "addition"]);
                }
              }
            }
          }
          controller.combinations = questionPool.sort(() => 0.5 - Math.random()).slice(0, 20);
        } else if (controller.modeChoice2 === 'dvi') {
          if (controller.modeChoice3 === 'neper') {
              for (let number1 = 10; number1 <= 99; number1++) {
                for (let number2 = 10; number2 <= 99; number2++) {
                  if (parseInt(number1.toString()[1]) + parseInt(number2.toString()[1]) < 10 && number1 + number2 < 100) {
                    questionPool.push([parseInt(number1), parseInt(number2), "addition"]);
                  }
                }
              }
            } else if (controller.modeChoice3 === 'per10') {
              for (let number1 = 10; number1 <= 99; number1++) {
                for (let number2 = 1; number2 <= 99; number2++) {
                  if (parseInt(number1.toString()[1]) + parseInt(number2.toString()[1]) > 10 && number1 + number2 < 100) {
                    questionPool.push([parseInt(number1), parseInt(number2), "addition"]);
                  }
                }
              }
            } 
            controller.combinations = questionPool.sort(() => 0.5 - Math.random()).slice(0, 20);
          } else if (controller.modeChoice2 === 'tukst') {
            if (controller.modeChoice3 === 'neper') {
                while (questionPool.length < 20) {
                  number1 = generateRandomNumber(101, 999);
                  number2 = generateRandomNumber(11, 999);
                    if (parseInt(number1.toString().slice(-1)[0]) + parseInt(number2.toString().slice(-1)[0]) < 10 && parseInt(number1.toString().slice(-2)[0]) + parseInt(number2.toString().slice(-2)[0]) < 10 && number1 + number2 < 1000) {
                      questionPool.push([parseInt(number1), parseInt(number2), "addition"]);
                  }
                }
            } else if (controller.modeChoice3 === 'per10') {
                  while (questionPool.length < 20) {
                    number1 = generateRandomNumber(101, 999);
                    number2 = generateRandomNumber(11, 999);
                      if ((parseInt(number1.toString().slice(-1)[0]) + parseInt(number2.toString().slice(-1)[0]) > 10 || parseInt(number1.toString().slice(-2)[0]) + parseInt(number2.toString().slice(-2)[0]) > 10) && number1 + number2 < 1000) {
                        questionPool.push([parseInt(number1), parseInt(number2), "addition"]);
                  }
                }
              }
              controller.combinations = questionPool.sort(() => 0.5 - Math.random()).slice(0, 20);
            } else if (controller.modeChoice2 === 'dtukst') {
              if (controller.modeChoice3 === 'neper') {
                  while (questionPool.length < 20) {
                    number1 = generateRandomNumber(1001, 9999);
                    number2 = generateRandomNumber(101, 9999);
                      if (parseInt(number1.toString().slice(-1)[0]) + parseInt(number2.toString().slice(-1)[0]) < 10 && parseInt(number1.toString().slice(-2)[0]) + parseInt(number2.toString().slice(-2)[0]) < 10 && parseInt(number1.toString().slice(-3)[0]) + parseInt(number2.toString().slice(-3)[0]) < 10 &&number1 + number2 < 10000) {
                        questionPool.push([parseInt(number1), parseInt(number2), "addition"]);
                    }
                  }
              } else if (controller.modeChoice3 === 'per10') {
                    while (questionPool.length < 20) {
                      number1 = generateRandomNumber(1001, 9999);
                      number2 = generateRandomNumber(101, 9999);
                        if ((parseInt(number1.toString().slice(-1)[0]) + parseInt(number2.toString().slice(-1)[0]) > 10 || parseInt(number1.toString().slice(-2)[0]) + parseInt(number2.toString().slice(-2)[0]) > 10 || parseInt(number1.toString().slice(-3)[0]) + parseInt(number2.toString().slice(-3)[0]) > 10) && number1 + number2 < 10000) {
                          questionPool.push([parseInt(number1), parseInt(number2), "addition"]);
                    }
                  }
                }
                controller.combinations = questionPool.sort(() => 0.5 - Math.random()).slice(0, 20);
              } 
      /*SUBTRACTION*/
      } else if (controller.modeChoice === 'atimtis') {
        if (controller.modeChoice2 === 'viena10') {
          if (controller.modeChoice3 === "neper") {
            for (let number1 = 1; number1 <= 9; number1++) {
              for (let number2 = 1; number2 <= 9; number2++) {
                 if (number1 > number2) {
                  questionPool.push([parseInt(number1), parseInt(number2), "subtraction"]);
                }
              }
            }
            controller.combinations = questionPool.sort(() => 0.5 - Math.random()).slice(0, 20);
          }

        } else if (controller.modeChoice2 === 'dvivien20') {
          if (controller.modeChoice3 === "neper") {
            for (let number1 = 10; number1 <= 19; number1++) {
              for (let number2 = 1; number2 <= 9; number2++) {
                if (parseInt(number1.toString()[1]) > number2) {
                  questionPool.push([parseInt(number1), parseInt(number2), "subtraction"]);
                }
              }
            }
          } if (controller.modeChoice3 === "per10") {
            for (let number1 = 10; number1 <= 19; number1++) {
              for (let number2 = 1; number2 <= 9; number2++) {
                if (parseInt(number1.toString()[1]) < number2) {
                  questionPool.push([parseInt(number1), parseInt(number2), "subtraction"]);
                }
              }
            }
          }
            controller.combinations = questionPool.sort(() => 0.5 - Math.random()).slice(0, 20);
      } else if (controller.modeChoice2 === 'dvivien') {
        if (controller.modeChoice3 === "neper") {
          for (let number1 = 10; number1 <= 99; number1++) {
            for (let number2 = 1; number2 <= 9; number2++) {
              if (parseInt(number1.toString()[1]) > number2) {
                questionPool.push([parseInt(number1), parseInt(number2), "subtraction"]);
              }
            }
          }
        } if (controller.modeChoice3 === "per10") {
          for (let number1 = 10; number1 <= 99; number1++) {
            for (let number2 = 1; number2 <= 9; number2++) {
              if (parseInt(number1.toString()[1]) < number2) {
                questionPool.push([parseInt(number1), parseInt(number2), "subtraction"]);
              }
            }
          }
        }
          controller.combinations = questionPool.sort(() => 0.5 - Math.random()).slice(0, 20);
    } else if (controller.modeChoice2 === 'dvi') {
      if (controller.modeChoice3 === "neper") {
        for (let number1 = 10; number1 <= 99; number1++) {
          for (let number2 = 10; number2 <= 99; number2++) {
            if (parseInt(number1.toString()[1]) > parseInt(number2.toString()[1]) && parseInt(number1.toString()[0]) > parseInt(number2.toString()[0]) && number1 > number2) {
              questionPool.push([parseInt(number1), parseInt(number2), "subtraction"]);
            }
          }
        }
      } if (controller.modeChoice3 === "per10") {
        for (let number1 = 10; number1 <= 99; number1++) {
          for (let number2 = 10; number2 <= 99; number2++) {
            if (parseInt(number1.toString()[1]) < parseInt(number2.toString()[1]) && number1 > number2) {
              questionPool.push([parseInt(number1), parseInt(number2), "subtraction"]);
            }
          }
        }
      }
        controller.combinations = questionPool.sort(() => 0.5 - Math.random()).slice(0, 20);
  } else if (controller.modeChoice2 === 'tukst') {
    if (controller.modeChoice3 === "neper") {
      while (questionPool.length < 20) {
        number1 =generateRandomNumber(101, 999)
        number2 =generateRandomNumber(11, 999)
        if (parseInt(number1.toString().slice(-1)[0]) > parseInt(number2.toString().slice(-1)[0]) && parseInt(number1.toString().slice(-2)[0]) > parseInt(number2.toString().slice(-2)[0]) && number1 > number2) {
          questionPool.push([parseInt(number1), parseInt(number2), "subtraction"]);
      }
    }
    } if (controller.modeChoice3 === "per10") {
      while (questionPool.length < 20) {
        number1 =generateRandomNumber(101, 999)
        number2 =generateRandomNumber(11, 999)
        if ((parseInt(number1.toString().slice(-1)[0]) < parseInt(number2.toString().slice(-1)[0]) || parseInt(number1.toString().slice(-2)[0]) < parseInt(number2.toString().slice(-2)[0])) && number1 > number2) {
          questionPool.push([parseInt(number1), parseInt(number2), "subtraction"]);
      }
    }
  }
      controller.combinations = questionPool.sort(() => 0.5 - Math.random()).slice(0, 20);
    } else if (controller.modeChoice2 === 'dtukst') {
      if (controller.modeChoice3 === "neper") {
        while (questionPool.length < 20) {
          number1 =generateRandomNumber(1001, 9999)
          number2 =generateRandomNumber(101, 9999)
          if (parseInt(number1.toString().slice(-1)[0]) > parseInt(number2.toString().slice(-1)[0]) && parseInt(number1.toString().slice(-2)[0]) > parseInt(number2.toString().slice(-2)[0]) && parseInt(number1.toString().slice(-3)[0]) > parseInt(number2.toString().slice(-3)[0]) && number1 > number2) {
            questionPool.push([parseInt(number1), parseInt(number2), "subtraction"]);
        }
      }
      } if (controller.modeChoice3 === "per10") {
        while (questionPool.length < 20) {
          number1 =generateRandomNumber(101, 999)
          number2 =generateRandomNumber(11, 999)
          if ((parseInt(number1.toString().slice(-1)[0]) < parseInt(number2.toString().slice(-1)[0]) || parseInt(number1.toString().slice(-2)[0]) < parseInt(number2.toString().slice(-2)[0]) || parseInt(number1.toString().slice(-3)[0]) < parseInt(number2.toString().slice(-3)[0])) && number1 > number2) {
            questionPool.push([parseInt(number1), parseInt(number2), "subtraction"]);
        }
      }
    }
        controller.combinations = questionPool.sort(() => 0.5 - Math.random()).slice(0, 20);
      }
  /*ADDITION AND SUBTRACTION*/
  } else if (controller.modeChoice === 'sudetis ir atimtis') {
    if (controller.modeChoice2 === 'viena10') {
      if (controller.modeChoice3 === 'neper') {
        for (let number1 = 1; number1 <= 9; number1++) {
          for (let number2 = 1; number2 <= 9; number2++) {
             if (number1 + number2 <= 10) {
              questionPool2.push([parseInt(number1), parseInt(number2), "addition"]);
            }
          }
        }
        questionPool2 = questionPool2.sort(() => 0.5 - Math.random()).slice(0, 10);
        for (let number1 = 1; number1 <= 9; number1++) {
          for (let number2 = 1; number2 <= 9; number2++) {
             if (number1 > number2) {
              questionPool3.push([parseInt(number1), parseInt(number2), "subtraction"]);
            }
          }
        }
        questionPool3 = questionPool3.sort(() => 0.5 - Math.random()).slice(0, 10);
        controller.combinations = questionPool2.concat(questionPool3).sort(() => 0.5 - Math.random()).slice(0, 20);
      }
    } else if (controller.modeChoice2 === 'lent') {
      if (controller.modeChoice3 === 'per10') {
        for (let number1 = 2; number1 <= 9; number1++) {
          for (let number2 = 2; number2 <= 9; number2++) {
            if (number1 + number2 > 10) {
              questionPool2.push([parseInt(number1), parseInt(number2), "addition"]);
            }
          }
        }
        for (let number1 = 11; number1 <= 19; number1++) {
          for (let number2 = 2; number2 <= 9; number2++) {
             if (parseInt(number1.toString()[1]) < number2) {
              questionPool3.push([parseInt(number1), parseInt(number2), "subtraction"]);
            }
          }
        }
        controller.combinations = questionPool2.concat(questionPool3).sort(() => 0.5 - Math.random());
      }
    } else if (controller.modeChoice2 === 'dvivien20') {
      if (controller.modeChoice3 === 'neper') {
          for (let number1 = 10; number1 <= 19; number1++) {
            for (let number2 = 1; number2 <= 9; number2++) {
              if (number1 + number2 <= 20) {
                questionPool2.push([parseInt(number1), parseInt(number2), "addition"]);
              }
            }
          }
          questionPool2 = questionPool2.sort(() => 0.5 - Math.random()).slice(0, 10);

          for (let number1 = 10; number1 <= 19; number1++) {
            for (let number2 = 1; number2 <= 9; number2++) {
              if (parseInt(number1.toString()[1]) > number2) {
                questionPool3.push([parseInt(number1), parseInt(number2), "subtraction"]);
              }
            }
          }
          questionPool3 = questionPool3.sort(() => 0.5 - Math.random()).slice(0, 10);
          controller.combinations = questionPool2.concat(questionPool3).sort(() => 0.5 - Math.random()).slice(0, 20);
        }
      } else if (controller.modeChoice2 === 'dvivien') {
        if (controller.modeChoice3 === 'neper') {
            for (let number1 = 10; number1 <= 99; number1++) {
              for (let number2 = 1; number2 <= 9; number2++) {
                if (parseInt(number1.toString()[1]) + number2 < 10 && number1 + number2 < 100) {
                  questionPool2.push([parseInt(number1), parseInt(number2), "addition"]);
                }
              }
            }
            questionPool2 = questionPool2.sort(() => 0.5 - Math.random()).slice(0, 10);
  
            for (let number1 = 10; number1 <= 99; number1++) {
              for (let number2 = 1; number2 <= 9; number2++) {
                if (parseInt(number1.toString()[1]) > number2) {
                  questionPool3.push([parseInt(number1), parseInt(number2), "subtraction"]);
                }
              }
            }
            questionPool3 = questionPool3.sort(() => 0.5 - Math.random()).slice(0, 10);
            controller.combinations = questionPool2.concat(questionPool3).sort(() => 0.5 - Math.random()).slice(0, 20);
        } else if (controller.modeChoice3 === 'per10') {
          for (let number1 = 10; number1 <= 99; number1++) {
            for (let number2 = 1; number2 <= 9; number2++) {
              if (parseInt(number1.toString()[1]) + number2 > 10 && number1 + number2 < 100) {
                questionPool2.push([parseInt(number1), parseInt(number2), "addition"]);
              }
            }
          }
          questionPool2 = questionPool2.sort(() => 0.5 - Math.random()).slice(0, 10);

          for (let number1 = 10; number1 <= 99; number1++) {
            for (let number2 = 1; number2 <= 9; number2++) {
              if (parseInt(number1.toString()[1]) < number2) {
                questionPool3.push([parseInt(number1), parseInt(number2), "subtraction"]);
              }
            }
          }
          questionPool3 = questionPool3.sort(() => 0.5 - Math.random()).slice(0, 10);
          controller.combinations = questionPool2.concat(questionPool3).sort(() => 0.5 - Math.random()).slice(0, 20);
        }
      }
        else if (controller.modeChoice2 === 'dvi') {
          if (controller.modeChoice3 === 'neper') {
            for (let number1 = 10; number1 <= 99; number1++) {
              for (let number2 = 10; number2 <= 99; number2++) {
                if (parseInt(number1.toString()[1]) + parseInt(number2.toString()[1]) < 10 && number1 + number2 < 100) {
                  questionPool2.push([parseInt(number1), parseInt(number2), "addition"]);
                }
              }
            }
            questionPool2 = questionPool2.sort(() => 0.5 - Math.random()).slice(0, 10);
  
            for (let number1 = 10; number1 <= 99; number1++) {
              for (let number2 = 10; number2 <= 99; number2++) {
                if (parseInt(number1.toString()[1]) > parseInt(number2.toString()[1]) && number1 > number2) {
                  questionPool3.push([parseInt(number1), parseInt(number2), "subtraction"]);
                }
              }
            }
            questionPool3 = questionPool3.sort(() => 0.5 - Math.random()).slice(0, 10);
            controller.combinations = questionPool2.concat(questionPool3).sort(() => 0.5 - Math.random()).slice(0, 20);
            
            } else if (controller.modeChoice3 === 'per10') {
              for (let number1 = 10; number1 <= 99; number1++) {
                for (let number2 = 10; number2 <= 99; number2++) {
                  if (parseInt(number1.toString()[1]) + parseInt(number2.toString()[1]) > 10 && number1 + number2 < 100) {
                    questionPool2.push([parseInt(number1), parseInt(number2), "addition"]);
                  }
                }
              }
              questionPool2 = questionPool2.sort(() => 0.5 - Math.random()).slice(0, 10);
    
              for (let number1 = 10; number1 <= 99; number1++) {
                for (let number2 = 10; number2 <= 99; number2++) {
                  if (parseInt(number1.toString()[1]) < parseInt(number2.toString()[1]) && number1 > number2) {
                    questionPool3.push([parseInt(number1), parseInt(number2), "subtraction"]);
                  }
                }
              }
              questionPool3 = questionPool3.sort(() => 0.5 - Math.random()).slice(0, 10);
              controller.combinations = questionPool2.concat(questionPool3).sort(() => 0.5 - Math.random()).slice(0, 20);
            }
           } else if (controller.modeChoice2 === 'tukst') {
            if (controller.modeChoice3 === 'neper') {
                while (questionPool2.length < 10) {
                  number1 = generateRandomNumber(101, 999);
                  number2 = generateRandomNumber(11, 999);
                    if (parseInt(number1.toString().slice(-1)[0]) + parseInt(number2.toString().slice(-1)[0]) < 10 && parseInt(number1.toString().slice(-2)[0]) + parseInt(number2.toString().slice(-2)[0]) < 10 &&number1 + number2 < 1000) {
                      questionPool2.push([parseInt(number1), parseInt(number2), "addition"]);
                  }
                }
                questionPool2 = questionPool2.sort(() => 0.5 - Math.random()).slice(0, 10);
                while (questionPool3.length < 10) {
                  number1 =generateRandomNumber(101, 999)
                  number2 =generateRandomNumber(11, 999)
                  if (parseInt(number1.toString().slice(-1)[0]) > parseInt(number2.toString().slice(-1)[0]) && parseInt(number1.toString().slice(-2)[0]) > parseInt(number2.toString().slice(-2)[0]) && number1 > number2) {
                    questionPool3.push([parseInt(number1), parseInt(number2), "subtraction"]);
                }
              }
              questionPool3 = questionPool3.sort(() => 0.5 - Math.random()).slice(0, 10);
              controller.combinations = questionPool2.concat(questionPool3).sort(() => 0.5 - Math.random()).slice(0, 20);

            } else if (controller.modeChoice3 === 'per10') {
                while (questionPool2.length < 10) {
                  number1 = generateRandomNumber(101, 999);
                  number2 = generateRandomNumber(11, 999);
                  if ((parseInt(number1.toString().slice(-1)[0]) + parseInt(number2.toString().slice(-1)[0]) > 10 || parseInt(number1.toString().slice(-2)[0]) + parseInt(number2.toString().slice(-2)[0]) > 10) && number1 + number2 < 1000) {
                    questionPool2.push([parseInt(number1), parseInt(number2), "addition"]);
                  }
                }
                questionPool2 = questionPool2.sort(() => 0.5 - Math.random()).slice(0, 10);
                while (questionPool3.length < 10) {
                  number1 =generateRandomNumber(101, 999)
                  number2 =generateRandomNumber(11, 999)
                  if ((parseInt(number1.toString().slice(-1)[0]) < parseInt(number2.toString().slice(-1)[0]) || parseInt(number1.toString().slice(-2)[0]) < parseInt(number2.toString().slice(-2)[0])) && number1 > number2) {
                    questionPool3.push([parseInt(number1), parseInt(number2), "subtraction"]);
                }
              }
              questionPool3 = questionPool3.sort(() => 0.5 - Math.random()).slice(0, 10);
              controller.combinations = questionPool2.concat(questionPool3).sort(() => 0.5 - Math.random()).slice(0, 20);
          }
        } 
        
        else if (controller.modeChoice2 === 'dtukst') {
              if (controller.modeChoice3 === 'neper') {
                  while (questionPool2.length < 10) {
                    number1 = generateRandomNumber(1001, 9999);
                    number2 = generateRandomNumber(101, 9999);
                      if (parseInt(number1.toString().slice(-1)[0]) + parseInt(number2.toString().slice(-1)[0]) < 10 && parseInt(number1.toString().slice(-2)[0]) + parseInt(number2.toString().slice(-2)[0]) < 10 && parseInt(number1.toString().slice(-3)[0]) + parseInt(number2.toString().slice(-3)[0]) < 10 &&number1 + number2 < 10000) {
                        questionPool2.push([parseInt(number1), parseInt(number2), "addition"]);
                    }
                  }
                  questionPool2 = questionPool2.sort(() => 0.5 - Math.random()).slice(0, 10);
                  while (questionPool3.length < 10) {
                    number1 =generateRandomNumber(1001, 9999)
                    number2 =generateRandomNumber(101, 9999)
                    if (parseInt(number1.toString().slice(-1)[0]) > parseInt(number2.toString().slice(-1)[0]) && parseInt(number1.toString().slice(-2)[0]) > parseInt(number2.toString().slice(-2)[0]) && parseInt(number1.toString().slice(-3)[0]) > parseInt(number2.toString().slice(-3)[0]) && number1 > number2) {
                      questionPool3.push([parseInt(number1), parseInt(number2), "subtraction"]);
                  }
                }
                questionPool3 = questionPool3.sort(() => 0.5 - Math.random()).slice(0, 10);
                controller.combinations = questionPool2.concat(questionPool3).sort(() => 0.5 - Math.random()).slice(0, 20);

              } else if (controller.modeChoice3 === 'per10') {
                  while (questionPool2.length < 10) {
                    number1 = generateRandomNumber(1001, 9999);
                    number2 = generateRandomNumber(101, 9999);
                    if ((parseInt(number1.toString().slice(-1)[0]) + parseInt(number2.toString().slice(-1)[0]) > 10 || parseInt(number1.toString().slice(-2)[0]) + parseInt(number2.toString().slice(-2)[0]) > 10 || parseInt(number1.toString().slice(-3)[0]) + parseInt(number2.toString().slice(-3)[0]) > 10) && number1 + number2 < 10000) {
                      questionPool2.push([parseInt(number1), parseInt(number2), "addition"]);
                    }
                  }
                  questionPool2 = questionPool2.sort(() => 0.5 - Math.random()).slice(0, 10);
                  while (questionPool3.length < 10) {
                    number1 =generateRandomNumber(1001, 9999)
                    number2 =generateRandomNumber(101, 9999)
                    if ((parseInt(number1.toString().slice(-1)[0]) < parseInt(number2.toString().slice(-1)[0]) || parseInt(number1.toString().slice(-2)[0]) < parseInt(number2.toString().slice(-2)[0]) || parseInt(number1.toString().slice(-3)[0]) < parseInt(number2.toString().slice(-3)[0])) && number1 > number2) {
                      questionPool3.push([parseInt(number1), parseInt(number2), "subtraction"]);
                  }
                }
                questionPool3 = questionPool3.sort(() => 0.5 - Math.random()).slice(0, 10);
                controller.combinations = questionPool2.concat(questionPool3).sort(() => 0.5 - Math.random()).slice(0, 20);
            }
          } 

/*MULTIPLICATION*/          
} else if (controller.modeChoice === 'daugyba') {
  if (controller.modeChoice2 === 'dauglent') {
    const firstNumber = controller.selectedNumbers[0];
    const secondNumber = controller.selectedNumbers[1];
    for (let number1 = firstNumber; number1 <= secondNumber; number1++) {
      for (let number2 = 1; number2 <= 10; number2++) {
        questionPool.push([parseInt(number1), parseInt(number2), "multiplication"]);
      }
    }
    controller.combinations = questionPool.sort(() => 0.5 - Math.random()).slice(0, 20);

  } else if (controller.modeChoice2 === 'daugdvivien') {
    while (questionPool.length < 20) {
      number1 = generateRandomNumber(11, 99);
      number2 = generateRandomNumber(2, 9);
      questionPool.push([parseInt(number1), parseInt(number2), "multiplication"]);
  }
  controller.combinations = questionPool.sort(() => 0.5 - Math.random()).slice(0, 20);

  } else if (controller.modeChoice2 === 'daugtrivien') {
    while (questionPool.length < 20) {
      number1 = generateRandomNumber(101, 999);
      number2 = generateRandomNumber(2, 9);
      questionPool.push([parseInt(number1), parseInt(number2), "multiplication"]);
  }
  controller.combinations = questionPool.sort(() => 0.5 - Math.random()).slice(0, 20);

  } else if (controller.modeChoice2 === 'daugketvien') {
    while (questionPool.length < 20) {
      number1 = generateRandomNumber(1001, 9999);
      number2 = generateRandomNumber(2, 9);
      questionPool.push([parseInt(number1), parseInt(number2), "multiplication"]);
  }
  controller.combinations = questionPool.sort(() => 0.5 - Math.random()).slice(0, 20);

  } else if (controller.modeChoice2 === 'daugtridvi') {
    while (questionPool.length < 20) {
      number1 = generateRandomNumber(101, 999);
      number2 = generateRandomNumber(11, 99);
      questionPool.push([parseInt(number1), parseInt(number2), "multiplication"]);
  }
  controller.combinations = questionPool.sort(() => 0.5 - Math.random()).slice(0, 20);

  } else if (controller.modeChoice2 === 'daugketdvi') {
    while (questionPool.length < 20) {
      number1 = generateRandomNumber(1001, 9999);
      number2 = generateRandomNumber(11, 99);
      questionPool.push([parseInt(number1), parseInt(number2), "multiplication"]);
  }
  controller.combinations = questionPool.sort(() => 0.5 - Math.random()).slice(0, 20);

  }
  
  
  











  else if (controller.modeChoice2 === 'daugdaugvien') {
    while (questionPool.length < 6) {

      interNumbers = [generateRandomNumber(11, 99), generateRandomNumber(2, 9)];
      number1 = Math.max(...interNumbers);
      number2 = Math.min(...interNumbers);

      questionPool.push([parseInt(number1), parseInt(number2), "multiplication"]);
  }
  while (questionPool.length < 14) {

    interNumbers = [generateRandomNumber(101, 999), generateRandomNumber(2, 9)];
    number1 = Math.max(...interNumbers);
    number2 = Math.min(...interNumbers);

    questionPool.push([parseInt(number1), parseInt(number2), "multiplication"]);
}

  while (questionPool.length < 20) {

    interNumbers = [generateRandomNumber(1001, 9999), generateRandomNumber(2, 9)];
    number1 = Math.max(...interNumbers);
    number2 = Math.min(...interNumbers);

    questionPool.push([parseInt(number1), parseInt(number2), "multiplication"]);
  }

  controller.combinations = questionPool.sort(() => 0.5 - Math.random()).slice(0, 20);

  }

  else if (controller.modeChoice2 === 'daugdaugdvi') {
    while (questionPool.length < 6) {

      interNumbers = [generateRandomNumber(11, 99), generateRandomNumber(11, 99)];
      number1 = Math.max(...interNumbers);
      number2 = Math.min(...interNumbers);

      questionPool.push([parseInt(number1), parseInt(number2), "multiplication"]);
  }
    while (questionPool.length < 14) {

      interNumbers = [generateRandomNumber(101, 999), generateRandomNumber(11, 99)];
      number1 = Math.max(...interNumbers);
      number2 = Math.min(...interNumbers);

      questionPool.push([parseInt(number1), parseInt(number2), "multiplication"]);
  }
    while (questionPool.length < 20) {

      interNumbers = [generateRandomNumber(1001, 9999), generateRandomNumber(11, 99)];
      number1 = Math.max(...interNumbers);
      number2 = Math.min(...interNumbers);

      questionPool.push([parseInt(number1), parseInt(number2), "multiplication"]);
    }
  controller.combinations = questionPool.sort(() => 0.5 - Math.random()).slice(0, 20);

  } else if (controller.modeChoice2 === 'daugdaug') {
    while (questionPool.length < 2) {

      interNumbers = [generateRandomNumber(11, 99), generateRandomNumber(2, 9)];
      number1 = Math.max(...interNumbers);
      number2 = Math.min(...interNumbers);

      questionPool.push([parseInt(number1), parseInt(number2), "multiplication"]);
  } while (questionPool.length < 4) {

    interNumbers = [generateRandomNumber(101, 999), generateRandomNumber(2, 9)];
    number1 = Math.max(...interNumbers);
    number2 = Math.min(...interNumbers);

    questionPool.push([parseInt(number1), parseInt(number2), "multiplication"]);
  } while (questionPool.length < 6) {

    interNumbers = [generateRandomNumber(1001, 9999), generateRandomNumber(2, 9)];
    number1 = Math.max(...interNumbers);
    number2 = Math.min(...interNumbers);

    questionPool.push([parseInt(number1), parseInt(number2), "multiplication"]);
  } while (questionPool2.length < 2) {

      interNumbers = [generateRandomNumber(11, 99), generateRandomNumber(11, 99)];
      number1 = Math.max(...interNumbers);
      number2 = Math.min(...interNumbers);

      questionPool2.push([parseInt(number1), parseInt(number2), "multiplication"]);
  }

  while (questionPool2.length < 6) {

    interNumbers = [generateRandomNumber(101, 999), generateRandomNumber(11, 99)];
    number1 = Math.max(...interNumbers);
    number2 = Math.min(...interNumbers);

    questionPool2.push([parseInt(number1), parseInt(number2), "multiplication"]);
}
  while (questionPool2.length < 8) {

    interNumbers = [generateRandomNumber(1001, 9999), generateRandomNumber(11, 99)];
    number1 = Math.max(...interNumbers);
    number2 = Math.min(...interNumbers);

    questionPool2.push([parseInt(number1), parseInt(number2), "multiplication"]);
  }


  while (questionPool3.length < 3) {

    interNumbers = [generateRandomNumber(101, 999), generateRandomNumber(101, 999)];
    number1 = Math.max(...interNumbers);
    number2 = Math.min(...interNumbers);

    questionPool3.push([parseInt(number1), parseInt(number2), "multiplication"]);
}
  while (questionPool3.length < 6) {

    interNumbers = [generateRandomNumber(1001, 9999), generateRandomNumber(101, 999)];
    number1 = Math.max(...interNumbers);
    number2 = Math.min(...interNumbers);

    questionPool3.push([parseInt(number1), parseInt(number2), "multiplication"]);
}

  controller.combinations = questionPool.concat(questionPool2, questionPool3).sort(() => 0.5 - Math.random()).slice(0, 20);
  }
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  else if (controller.modeChoice2 === 'pil10') {
    for (let number1 = 1; number1 <= 10; number1++) {
      for (let number2 = 10; number2 <= 90; number2+=10) {
        questionPool.push([parseInt(number2), parseInt(number1), "multiplication"]);
      }
    }
    controller.combinations = questionPool.sort(() => 0.5 - Math.random()).slice(0, 20);
  } else if (controller.modeChoice2 === 'pil100') {
    for (let number1 = 1; number1 <= 10; number1++) {
      for (let number2 = 100; number2 <= 900; number2+=100) {
        questionPool.push([parseInt(number2), parseInt(number1), "multiplication"]);
      }
    }
    controller.combinations = questionPool.sort(() => 0.5 - Math.random()).slice(0, 20);
  }
  
/*DIVISION*/
} else if (controller.modeChoice === 'dalyba') {
  if (controller.modeChoice2 === 'dauglent') {
    var firstNumber = parseInt(controller.selectedNumbers[0]);
    var secondNumber = parseInt(controller.selectedNumbers[1]);
    if (controller.withRemainder) {
      if (firstNumber === 1) {
        firstNumber = firstNumber + 1;
      }
      if (secondNumber === 1) {
        secondNumber = secondNumber + 1;
      }
    }

    for (let number1 = firstNumber; number1 <= secondNumber; number1++) {
      for (let number2 = 1; number2 <= 10; number2++) {
        if (controller.withRemainder) {
          remainder = generateRandomNumber(1, number1)
        }
        if (controller.withRemainder) {
        if ((((number1 * number2) + remainder) % number1) !== 0) {
        questionPool.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
        }
      } else {
        questionPool.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
      }
    }
    }
    controller.combinations = questionPool.sort(() => 0.5 - Math.random()).slice(0, 20);
  } else if (controller.modeChoice2 === 'daugdvivien') {
    while (questionPool.length < 20) {
      let number1 = generateRandomNumber(2, 9);
      let number2 = generateRandomNumber(11, 99);
      if (controller.withRemainder) {
        remainder = generateRandomNumber(1, number1)
      }
      dalinys = (number1 * number2) + remainder;

      if (dalinys <= 99 && Number(dalinys.toString()[dalinys.toString().length - 1]) !== 0) {
        if (controller.withRemainder) {
          if (dalinys % number1 !== 0) {
        questionPool.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
          }
        } else {
          questionPool.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
        }
    }
  }
  controller.combinations = questionPool.sort(() => 0.5 - Math.random()).slice(0, 20);

  } else if (controller.modeChoice2 === 'daugtrivien') {
    while (questionPool.length < 10) {
      let number1 = generateRandomNumber(2, 9);
      let number2 = generateRandomNumber(11, 99);
      if (controller.withRemainder) {
        remainder = generateRandomNumber(1, number1)
      }

      dalinys = (number1 * number2) + remainder;

      if (100 < dalinys && dalinys <= 999 && Number(dalinys.toString()[dalinys.toString().length - 1]) !== 0) {
        if (controller.withRemainder) {
          if (dalinys % number1 !== 0) {
        questionPool.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
          }
        } else {
          questionPool.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
        }
    }
  }

  while (questionPool.length < 20) {
    let number1 = generateRandomNumber(2, 9);
    let number2 = generateRandomNumber(101, 999);
    if (controller.withRemainder) {
      remainder = generateRandomNumber(1, number1)
    }

    dalinys = (number1 * number2) + remainder;

    if (100 < dalinys && dalinys <= 999 && Number(dalinys.toString()[dalinys.toString().length - 1]) !== 0) {
      if (controller.withRemainder) {
        if (dalinys % number1 !== 0) {
      questionPool.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
        }
      } else {
        questionPool.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
      }
  }
}

  controller.combinations = questionPool.sort(() => 0.5 - Math.random()).slice(0, 20);

  } 
  
  
  
  
  
  
  
  else if (controller.modeChoice2 === 'daugketvien') {
    while (questionPool.length < 10) {
      let number1 = generateRandomNumber(2, 9);
      let number2 = generateRandomNumber(101, 9999);
      if (controller.withRemainder) {
        remainder = generateRandomNumber(1, number1)
      }
      dalinys = (number1 * number2) + remainder;

      if (1000 < dalinys && dalinys <= 9999 && Number(dalinys.toString()[dalinys.toString().length - 1]) !== 0) {
        if (controller.withRemainder) {
          if (dalinys % number1 !== 0) {
        questionPool.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
          }
        } else {
          questionPool.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
        }
    }
  }


  while (questionPool.length < 20) {
    let number1 = generateRandomNumber(2, 9);
    let number2 = generateRandomNumber(1001, 9999);
    if (controller.withRemainder) {
      remainder = generateRandomNumber(1, number1)
    }
    dalinys = (number1 * number2) + remainder;

    if (dalinys <= 9999 && Number(dalinys.toString()[dalinys.toString().length - 1]) !== 0) {
      if (controller.withRemainder) {
        if (dalinys % number1 !== 0) {
      questionPool.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
        }
      } else {
        questionPool.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
      }
  }
}

  controller.combinations = questionPool.sort(() => 0.5 - Math.random()).slice(0, 20);





  } else if (controller.modeChoice2 === 'daugtridvi') {
    while (questionPool.length < 10) {
      let number1 = generateRandomNumber(11, 99);
      let number2 = generateRandomNumber(2, 9);
      if (controller.withRemainder) {
        remainder = generateRandomNumber(1, number1)
      }
      dalinys = (number1 * number2) + remainder;

      if (100 < dalinys && dalinys <= 999 && Number(dalinys.toString()[dalinys.toString().length - 1]) !== 0) {
        if (controller.withRemainder) {
          if (dalinys % number1 !== 0) {
        questionPool.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
          }
        } else {
          questionPool.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
        }
    }
  }

  while (questionPool.length < 20) {
    let number1 = generateRandomNumber(11, 99);
    let number2 = generateRandomNumber(11, 99);
    if (controller.withRemainder) {
      remainder = generateRandomNumber(1, number1)
    }
    dalinys = (number1 * number2) + remainder;

    if (dalinys <= 999 && Number(dalinys.toString()[dalinys.toString().length - 1]) !== 0) {
      if (controller.withRemainder) {
        if (dalinys % number1 !== 0) {
      questionPool.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
        }
      } else {
        questionPool.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
      }
  }
}
  controller.combinations = questionPool.sort(() => 0.5 - Math.random()).slice(0, 20);





  
  } else if (controller.modeChoice2 === 'daugketdvi') {
    while (questionPool.length < 10) {
      let number1 = generateRandomNumber(11, 99);
      let number2 = generateRandomNumber(11, 99);
      if (controller.withRemainder) {
        remainder = generateRandomNumber(1, number1)
      }
      dalinys = (number1 * number2) + remainder;

      if (1000 < dalinys && dalinys <= 9999 && Number(dalinys.toString()[dalinys.toString().length - 1]) !== 0) {
        if (controller.withRemainder) {
          if (dalinys % number1 !== 0) {
        questionPool.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
          }
        } else {
          questionPool.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
        }
    }
  }
  while (questionPool.length < 20) {
    let number1 = generateRandomNumber(11, 99);
    let number2 = generateRandomNumber(101, 999);
    if (controller.withRemainder) {
      remainder = generateRandomNumber(1, number1)
    }
    dalinys = (number1 * number2) + remainder;

    if (dalinys <= 9999 && Number(dalinys.toString()[dalinys.toString().length - 1]) !== 0) {
      if (controller.withRemainder) {
        if (dalinys % number1 !== 0) {
      questionPool.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
        }
      } else {
        questionPool.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
      }
  }
}

  controller.combinations = questionPool.sort(() => 0.5 - Math.random()).slice(0, 20);
} 
  
  else if (controller.modeChoice2 === 'daugdaugvien') {
    while (questionPool.length < 6) {
      let number1 = generateRandomNumber(2, 9);
      let number2 = generateRandomNumber(11, 99);
      if (controller.withRemainder) {
        remainder = generateRandomNumber(1, number1)
      }
      dalinys = (number1 * number2) + remainder;
      if (dalinys <= 99999 && Number(dalinys.toString()[dalinys.toString().length - 1]) !== 0) {
        if (controller.withRemainder) {
          if (dalinys % number1 !== 0) {
        questionPool.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
          }
        } else {
          questionPool.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
        }
    }
  }
  while (questionPool.length < 14) {
    let number1 = generateRandomNumber(2, 9);
    let number2 = generateRandomNumber(101, 999);
    if (controller.withRemainder) {
      remainder = generateRandomNumber(1, number1)
    }
    dalinys = (number1 * number2) + remainder;
    if (dalinys <= 99999 && Number(dalinys.toString()[dalinys.toString().length - 1]) !== 0) {
      if (controller.withRemainder) {
        if (dalinys % number1 !== 0) {
      questionPool.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
        }
      } else {
        questionPool.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
      }
  }
}
while (questionPool.length < 20) {
  let number1 = generateRandomNumber(2, 9);
  let number2 = generateRandomNumber(1001, 9999);
  if (controller.withRemainder) {
    remainder = generateRandomNumber(1, number1)
  }
  dalinys = (number1 * number2) + remainder;
  if (dalinys <= 99999 && Number(dalinys.toString()[dalinys.toString().length - 1]) !== 0) {
    if (controller.withRemainder) {
      if (dalinys % number1 !== 0) {
    questionPool.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
      }
    } else {
      questionPool.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
    }
}
}

  controller.combinations = questionPool.sort(() => 0.5 - Math.random()).slice(0, 20);
}

else if (controller.modeChoice2 === 'daugdaugdvi') {
  while (questionPool.length < 6) {
    let number1 = generateRandomNumber(11, 99);
    let number2 = generateRandomNumber(11, 99);
    if (controller.withRemainder) {
      remainder = generateRandomNumber(1, number1)
    }
    dalinys = (number1 * number2) + remainder;
    if (dalinys <= 99999 && Number(dalinys.toString()[dalinys.toString().length - 1]) !== 0) {
      if (controller.withRemainder) {
        if (dalinys % number1 !== 0) {
      questionPool.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
        }
      } else {
        questionPool.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
      }
  }
}
while (questionPool.length < 14) {
  let number1 = generateRandomNumber(11, 99);
  let number2 = generateRandomNumber(101, 999);
  if (controller.withRemainder) {
    remainder = generateRandomNumber(1, number1)
  }
  dalinys = (number1 * number2) + remainder;
  if (dalinys <= 99999 && Number(dalinys.toString()[dalinys.toString().length - 1]) !== 0) {
    if (controller.withRemainder) {
      if (dalinys % number1 !== 0) {
    questionPool.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
      }
    } else {
      questionPool.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
    }
}
}
while (questionPool.length < 20) {
let number1 = generateRandomNumber(11, 99);
let number2 = generateRandomNumber(1001, 9999);
if (controller.withRemainder) {
  remainder = generateRandomNumber(1, number1)
}
dalinys = (number1 * number2) + remainder;
if (dalinys <= 99999 && Number(dalinys.toString()[dalinys.toString().length - 1]) !== 0) {
  if (controller.withRemainder) {
    if (dalinys % number1 !== 0) {
  questionPool.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
    }
  } else {
    questionPool.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
  }
}
}

controller.combinations = questionPool.sort(() => 0.5 - Math.random()).slice(0, 20);
}
  
  
  
  
  
  
  
  else if (controller.modeChoice2 === 'daugdaug') {
    while (questionPool.length < 3) {
      let number1 = generateRandomNumber(2, 9);
      let number2 = generateRandomNumber(11, 99);
      if (controller.withRemainder) {
        remainder = generateRandomNumber(1, number1)
      }
      dalinys = (number1 * number2) + remainder;
      if (100 < dalinys && dalinys <= 99999 && Number(dalinys.toString()[dalinys.toString().length - 1]) !== 0) {
        if (controller.withRemainder) {
          if (dalinys % number1 !== 0) {
        questionPool.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
          }
        } else {
          questionPool.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
        }
    }
  }
while (questionPool.length < 7) {
  let number1 = generateRandomNumber(2, 9);
  let number2 = generateRandomNumber(101, 999);
  if (controller.withRemainder) {
    remainder = generateRandomNumber(1, number1)
  }
  dalinys = (number1 * number2) + remainder;
  if (dalinys <= 99999 && Number(dalinys.toString()[dalinys.toString().length - 1]) !== 0) {
    if (controller.withRemainder) {
      if (dalinys % number1 !== 0) {
    questionPool.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
      }
    } else {
      questionPool.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
    }
}
}
while (questionPool.length < 10) {
  let number1 = generateRandomNumber(2, 9);
  let number2 = generateRandomNumber(1001, 9999);
  if (controller.withRemainder) {
    remainder = generateRandomNumber(1, number1)
  }
  dalinys = (number1 * number2) + remainder;
  if (dalinys <= 99999 && Number(dalinys.toString()[dalinys.toString().length - 1]) !== 0) {
    if (controller.withRemainder) {
      if (dalinys % number1 !== 0) {
    questionPool.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
      }
    } else {
      questionPool.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
    }
}
}





while (questionPool.length < 13) {
  let number1 = generateRandomNumber(11, 99);
  let number2 = generateRandomNumber(11, 99);
  if (controller.withRemainder) {
    remainder = generateRandomNumber(1, number1)
  }
  dalinys = (number1 * number2) + remainder;
  if (100 < dalinys && dalinys <= 99999 && Number(dalinys.toString()[dalinys.toString().length - 1]) !== 0) {
    if (controller.withRemainder) {
      if (dalinys % number1 !== 0) {
    questionPool.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
      }
    } else {
      questionPool.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
    }
}
}
while (questionPool.length < 17) {
let number1 = generateRandomNumber(11, 99);
let number2 = generateRandomNumber(101, 999);
if (controller.withRemainder) {
  remainder = generateRandomNumber(1, number1)
}
dalinys = (number1 * number2) + remainder;
if (dalinys <= 99999 && Number(dalinys.toString()[dalinys.toString().length - 1]) !== 0) {
  if (controller.withRemainder) {
    if (dalinys % number1 !== 0) {
  questionPool.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
    }
  } else {
    questionPool.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
  }
}
}

while (questionPool.length < 20) {
let number1 = generateRandomNumber(11, 99);
let number2 = generateRandomNumber(1001, 9999);
if (controller.withRemainder) {
remainder = generateRandomNumber(1, number1)
}
dalinys = (number1 * number2) + remainder;
if (dalinys <= 99999 && Number(dalinys.toString()[dalinys.toString().length - 1]) !== 0) {
if (controller.withRemainder) {
  if (dalinys % number1 !== 0) {
questionPool.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
  }
} else {
  questionPool.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
}
}
}
  controller.combinations = questionPool.sort(() => 0.5 - Math.random()).slice(0, 20);


  }
  
  
  else if (controller.modeChoice2 === 'pil10') {
    for (let number1 = 1; number1 <= 9; number1++) {
      for (let number2 = 1; number2 <= 9; number2++) {
        if (controller.withRemainder) {
          remainder = generateRandomNumber(1, number1*10)
        }

        dalinys = (number1 * number2 * 10) + remainder;


          if (controller.withRemainder) {
            if (dalinys % number1*10 !== 0) {
              questionPool.push([parseInt(number1 * number2 * 10) + remainder, parseInt(number1 * 10), "division"]);
            }
          } else {
            questionPool.push([parseInt(number1 * number2 * 10) + remainder, parseInt(number1 * 10), "division"]);
          }
      
    }

      }
    
    controller.combinations = questionPool.sort(() => 0.5 - Math.random()).slice(0, 20);
  } else if (controller.modeChoice2 === 'pil100') {
    for (let number1 = 1; number1 <= 10; number1++) {
      for (let number2 = 1; number2 <= 9; number2++) {
        if (controller.withRemainder) {
          remainder = generateRandomNumber(1, number1*100)
        }
        dalinys = (number1 * number2 * 100) + remainder;


        if (controller.withRemainder) {
          if (dalinys % number1*100 !== 0) {
            questionPool.push([parseInt(number1 * number2 * 100) + remainder, parseInt(number1 * 100), "division"]);
          }
        } else {
          questionPool.push([parseInt(number1 * number2 * 100) + remainder, parseInt(number1 * 100), "division"]);
        }
    
  }

    }
  
    controller.combinations = questionPool.sort(() => 0.5 - Math.random()).slice(0, 20);
  }

  
/*MULTIPLICATION AND DIVISION*/
} else if (controller.modeChoice === 'daugyba ir dalyba') {
  if (controller.modeChoice2 === 'dauglent') {
    var firstNumber = parseInt(controller.selectedNumbers[0]);
    var secondNumber = parseInt(controller.selectedNumbers[1]);
    for (let number1 = firstNumber; number1 <= secondNumber; number1++) {
      for (let number2 = 1; number2 <= 10; number2++) {
        questionPool2.push([parseInt(number1), parseInt(number2), "multiplication"]);
      }
    }
    
    if (controller.withRemainder) {
      if (firstNumber === 1) {
        firstNumber = firstNumber + 1;
      }
      if (secondNumber === 1) {
        secondNumber = secondNumber + 1;
      }
    }

    for (let number1 = firstNumber; number1 <= secondNumber; number1++) {
      for (let number2 = 1; number2 <= 10; number2++) {
        if (controller.withRemainder) {
          remainder = generateRandomNumber(1, number1)
        }
        if (controller.withRemainder) {
        if ((((number1 * number2) + remainder) % number1) !== 0) {
        questionPool3.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
        }
      } else {
        questionPool3.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
      }
    }
    }

    controller.combinations = questionPool2.concat(questionPool3).sort(() => 0.5 - Math.random()).slice(0, 20);
  } else if (controller.modeChoice2 === 'daugdvivien') {
    while (questionPool2.length < 10) {
        let number1 = generateRandomNumber(11, 99);
        let number2 = generateRandomNumber(2, 9);
        questionPool2.push([parseInt(number1), parseInt(number2), "multiplication"]);
    }
    while (questionPool3.length < 10) {
        let number1 = generateRandomNumber(2, 9);
        let number2 = generateRandomNumber(11, 99);
        if (controller.withRemainder) {
          remainder = generateRandomNumber(1, number1)
        }
        dalinys = (number1 * number2) + remainder;
        if (dalinys <= 99 && Number(dalinys.toString()[dalinys.toString().length - 1]) !== 0) {
          if (controller.withRemainder) {
            if (dalinys % number1 !== 0) {
          questionPool3.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
            }
          } else {
            questionPool3.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
          }
      }
    }
    controller.combinations = questionPool2.concat(questionPool3).sort(() => 0.5 - Math.random()).slice(0, 20);
} else if (controller.modeChoice2 === 'daugtrivien') {
  while (questionPool2.length < 10) {
      let number1 = generateRandomNumber(101, 999);
      let number2 = generateRandomNumber(2, 9);
      questionPool2.push([parseInt(number1), parseInt(number2), "multiplication"]);
  }


  while (questionPool3.length < 10) {
    let number1 = generateRandomNumber(2, 9);
    let number2 = generateRandomNumber(11, 99);
    if (controller.withRemainder) {
      remainder = generateRandomNumber(1, number1)
    }

    dalinys = (number1 * number2) + remainder;

    if (100 < dalinys && dalinys <= 999 && Number(dalinys.toString()[dalinys.toString().length - 1]) !== 0) {
      if (controller.withRemainder) {
        if (dalinys % number1 !== 0) {
      questionPool3.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
        }
      } else {
        questionPool3.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
      }
  }
}

while (questionPool3.length < 20) {
  let number1 = generateRandomNumber(2, 9);
  let number2 = generateRandomNumber(101, 999);
  if (controller.withRemainder) {
    remainder = generateRandomNumber(1, number1)
  }

  dalinys = (number1 * number2) + remainder;

  if (100 < dalinys && dalinys <= 999 && Number(dalinys.toString()[dalinys.toString().length - 1]) !== 0) {
    if (controller.withRemainder) {
      if (dalinys % number1 !== 0) {
    questionPool3.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
      }
    } else {
      questionPool3.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
    }
}
}

  controller.combinations = questionPool2.concat(questionPool3).sort(() => 0.5 - Math.random()).slice(0, 20);
} else if (controller.modeChoice2 === 'daugketvien') {
  while (questionPool2.length < 10) {
      let number1 = generateRandomNumber(1001, 9999);
      let number2 = generateRandomNumber(2, 9);
      questionPool2.push([parseInt(number1), parseInt(number2), "multiplication"]);
  }
  while (questionPool3.length < 10) {
    let number1 = generateRandomNumber(2, 9);
    let number2 = generateRandomNumber(101, 9999);
    if (controller.withRemainder) {
      remainder = generateRandomNumber(1, number1)
    }
    dalinys = (number1 * number2) + remainder;

    if (1000 < dalinys && dalinys <= 9999 && Number(dalinys.toString()[dalinys.toString().length - 1]) !== 0) {
      if (controller.withRemainder) {
        if (dalinys % number1 !== 0) {
      questionPool3.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
        }
      } else {
        questionPool3.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
      }
  }
}

while (questionPool3.length < 20) {
  let number1 = generateRandomNumber(2, 9);
  let number2 = generateRandomNumber(1001, 9999);
  if (controller.withRemainder) {
    remainder = generateRandomNumber(1, number1)
  }
  dalinys = (number1 * number2) + remainder;

  if (dalinys <= 9999 && Number(dalinys.toString()[dalinys.toString().length - 1]) !== 0) {
    if (controller.withRemainder) {
      if (dalinys % number1 !== 0) {
    questionPool3.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
      }
    } else {
      questionPool3.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
    }
}
}
  controller.combinations = questionPool2.concat(questionPool3).sort(() => 0.5 - Math.random()).slice(0, 20);
} else if (controller.modeChoice2 === 'daugtridvi') {
while (questionPool2.length < 10) {
    let number1 = generateRandomNumber(101, 999);
    let number2 = generateRandomNumber(11, 99);
    questionPool2.push([parseInt(number1), parseInt(number2), "multiplication"]);
}

while (questionPool3.length < 10) {
  let number1 = generateRandomNumber(11, 99);
  let number2 = generateRandomNumber(2, 9);
  if (controller.withRemainder) {
    remainder = generateRandomNumber(1, number1)
  }
  dalinys = (number1 * number2) + remainder;

  if (100 < dalinys && dalinys <= 999 && Number(dalinys.toString()[dalinys.toString().length - 1]) !== 0) {
    if (controller.withRemainder) {
      if (dalinys % number1 !== 0) {
    questionPool3.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
      }
    } else {
      questionPool3.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
    }
}
}

while (questionPool3.length < 20) {
let number1 = generateRandomNumber(11, 99);
let number2 = generateRandomNumber(11, 99);
if (controller.withRemainder) {
  remainder = generateRandomNumber(1, number1)
}
dalinys = (number1 * number2) + remainder;

if (dalinys <= 999 && Number(dalinys.toString()[dalinys.toString().length - 1]) !== 0) {
  if (controller.withRemainder) {
    if (dalinys % number1 !== 0) {
  questionPool3.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
    }
  } else {
    questionPool3.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
  }
}
}

controller.combinations = questionPool2.concat(questionPool3).sort(() => 0.5 - Math.random()).slice(0, 20);
} else if (controller.modeChoice2 === 'daugketdvi') {
while (questionPool2.length < 10) {
    let number1 = generateRandomNumber(1001, 9999);
    let number2 = generateRandomNumber(11, 99);
    questionPool2.push([parseInt(number1), parseInt(number2), "multiplication"]);
}
while (questionPool3.length < 10) {
  let number1 = generateRandomNumber(11, 99);
  let number2 = generateRandomNumber(11, 99);
  if (controller.withRemainder) {
    remainder = generateRandomNumber(1, number1)
  }
  dalinys = (number1 * number2) + remainder;

  if (1000 < dalinys && dalinys <= 9999 && Number(dalinys.toString()[dalinys.toString().length - 1]) !== 0) {
    if (controller.withRemainder) {
      if (dalinys % number1 !== 0) {
    questionPool3.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
      }
    } else {
      questionPool3.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
    }
}
}
while (questionPool3.length < 20) {
let number1 = generateRandomNumber(11, 99);
let number2 = generateRandomNumber(101, 999);
if (controller.withRemainder) {
  remainder = generateRandomNumber(1, number1)
}
dalinys = (number1 * number2) + remainder;

if (dalinys <= 9999 && Number(dalinys.toString()[dalinys.toString().length - 1]) !== 0) {
  if (controller.withRemainder) {
    if (dalinys % number1 !== 0) {
  questionPool3.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
    }
  } else {
    questionPool3.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
  }
}
}
controller.combinations = questionPool2.concat(questionPool3).sort(() => 0.5 - Math.random()).slice(0, 20);
} else if (controller.modeChoice2 === 'daugdaug') {
  while (questionPool2.length < 2) {

    interNumbers = [generateRandomNumber(11, 99), generateRandomNumber(2, 9)];
    number1 = Math.max(...interNumbers);
    number2 = Math.min(...interNumbers);

    questionPool2.push([parseInt(number1), parseInt(number2), "multiplication"]);
} while (questionPool2.length < 6) {

  interNumbers = [generateRandomNumber(101, 999), generateRandomNumber(2, 9)];
  number1 = Math.max(...interNumbers);
  number2 = Math.min(...interNumbers);

  questionPool2.push([parseInt(number1), parseInt(number2), "multiplication"]);
} while (questionPool2.length < 8) {

  interNumbers = [generateRandomNumber(1001, 9999), generateRandomNumber(2, 9)];
  number1 = Math.max(...interNumbers);
  number2 = Math.min(...interNumbers);

  questionPool2.push([parseInt(number1), parseInt(number2), "multiplication"]);
} while (questionPool2.length < 10) {

    interNumbers = [generateRandomNumber(11, 99), generateRandomNumber(11, 99)];
    number1 = Math.max(...interNumbers);
    number2 = Math.min(...interNumbers);

    questionPool2.push([parseInt(number1), parseInt(number2), "multiplication"]);
}

while (questionPool2.length < 13) {

  interNumbers = [generateRandomNumber(101, 999), generateRandomNumber(11, 99)];
  number1 = Math.max(...interNumbers);
  number2 = Math.min(...interNumbers);

  questionPool2.push([parseInt(number1), parseInt(number2), "multiplication"]);
}
while (questionPool2.length < 15) {

  interNumbers = [generateRandomNumber(1001, 9999), generateRandomNumber(11, 99)];
  number1 = Math.max(...interNumbers);
  number2 = Math.min(...interNumbers);

  questionPool2.push([parseInt(number1), parseInt(number2), "multiplication"]);
}


while (questionPool2.length < 18) {

  interNumbers = [generateRandomNumber(101, 999), generateRandomNumber(101, 999)];
  number1 = Math.max(...interNumbers);
  number2 = Math.min(...interNumbers);

  questionPool2.push([parseInt(number1), parseInt(number2), "multiplication"]);
}
while (questionPool2.length < 20) {

  interNumbers = [generateRandomNumber(1001, 9999), generateRandomNumber(101, 999)];
  number1 = Math.max(...interNumbers);
  number2 = Math.min(...interNumbers);

  questionPool2.push([parseInt(number1), parseInt(number2), "multiplication"]);
}







while (questionPool3.length < 3) {
  let number1 = generateRandomNumber(2, 9);
  let number2 = generateRandomNumber(11, 99);
  if (controller.withRemainder) {
    remainder = generateRandomNumber(1, number1)
  }
  dalinys = (number1 * number2) + remainder;
  if (100 < dalinys && dalinys <= 99999 && Number(dalinys.toString()[dalinys.toString().length - 1]) !== 0) {
    if (controller.withRemainder) {
      if (dalinys % number1 !== 0) {
    questionPool3.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
      }
    } else {
      questionPool3.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
    }
}
}
while (questionPool3.length < 7) {
let number1 = generateRandomNumber(2, 9);
let number2 = generateRandomNumber(101, 999);
if (controller.withRemainder) {
remainder = generateRandomNumber(1, number1)
}
dalinys = (number1 * number2) + remainder;
if (dalinys <= 99999 && Number(dalinys.toString()[dalinys.toString().length - 1]) !== 0) {
if (controller.withRemainder) {
  if (dalinys % number1 !== 0) {
questionPool3.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
  }
} else {
  questionPool3.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
}
}
}
while (questionPool3.length < 10) {
let number1 = generateRandomNumber(2, 9);
let number2 = generateRandomNumber(1001, 9999);
if (controller.withRemainder) {
remainder = generateRandomNumber(1, number1)
}
dalinys = (number1 * number2) + remainder;
if (dalinys <= 99999 && Number(dalinys.toString()[dalinys.toString().length - 1]) !== 0) {
if (controller.withRemainder) {
  if (dalinys % number1 !== 0) {
questionPool3.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
  }
} else {
  questionPool3.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
}
}
}
while (questionPool3.length < 13) {
let number1 = generateRandomNumber(11, 99);
let number2 = generateRandomNumber(11, 99);
if (controller.withRemainder) {
remainder = generateRandomNumber(1, number1)
}
dalinys = (number1 * number2) + remainder;
if (100 < dalinys && dalinys <= 99999 && Number(dalinys.toString()[dalinys.toString().length - 1]) !== 0) {
if (controller.withRemainder) {
  if (dalinys % number1 !== 0) {
questionPool3.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
  }
} else {
  questionPool3.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
}
}
}
while (questionPool3.length < 17) {
let number1 = generateRandomNumber(11, 99);
let number2 = generateRandomNumber(101, 999);
if (controller.withRemainder) {
remainder = generateRandomNumber(1, number1)
}
dalinys = (number1 * number2) + remainder;
if (dalinys <= 99999 && Number(dalinys.toString()[dalinys.toString().length - 1]) !== 0) {
if (controller.withRemainder) {
if (dalinys % number1 !== 0) {
questionPool3.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
}
} else {
questionPool3.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
}
}
}

while (questionPool3.length < 20) {
let number1 = generateRandomNumber(11, 99);
let number2 = generateRandomNumber(1001, 9999);
if (controller.withRemainder) {
remainder = generateRandomNumber(1, number1)
}
dalinys = (number1 * number2) + remainder;
if (dalinys <= 99999 && Number(dalinys.toString()[dalinys.toString().length - 1]) !== 0) {
if (controller.withRemainder) {
if (dalinys % number1 !== 0) {
questionPool3.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
}
} else {
questionPool3.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
}
}
}
  controller.combinations = questionPool2.concat(questionPool3).sort(() => 0.5 - Math.random()).slice(0, 20);
  } else if (controller.modeChoice2 === 'pil10') {
    for (let number1 = 1; number1 <= 10; number1++) {
      for (let number2 = 10; number2 <= 90; number2+=10) {
        questionPool2.push([parseInt(number2), parseInt(number1), "multiplication"]);
      }
    }
    for (let number1 = 1; number1 <= 10; number1++) {
      for (let number2 = 1; number2 <= 9; number2++) {
        if (controller.withRemainder) {
          remainder = generateRandomNumber(1, number1*10)
        }
        dalinys = (number1 * number2 * 10) + remainder;


          if (controller.withRemainder) {
            if (dalinys % number1*10 !== 0) {
              questionPool2.push([parseInt(number1 * number2 * 10) + remainder, parseInt(number1 * 10), "division"]);
            }
          } else {
            questionPool2.push([parseInt(number1 * number2 * 10) + remainder, parseInt(number1 * 10), "division"]);
          }
      
    }

      }
    questionPool2 = questionPool2.sort(() => 0.5 - Math.random()).slice(0, 10);
    questionPool3 = questionPool3.sort(() => 0.5 - Math.random()).slice(0, 10);
    controller.combinations = questionPool2.concat(questionPool3).sort(() => 0.5 - Math.random()).slice(0, 20);
  } else if (controller.modeChoice2 === 'pil100') {
    for (let number1 = 1; number1 <= 10; number1++) {
      for (let number2 = 100; number2 <= 900; number2+=100) {
        questionPool2.push([parseInt(number2), parseInt(number1), "multiplication"]);
      }
    }
    for (let number1 = 1; number1 <= 10; number1++) {
      for (let number2 = 1; number2 <= 9; number2++) {
        if (controller.withRemainder) {
          remainder = generateRandomNumber(1, number1*100)
        }
        dalinys = (number1 * number2 * 10) + remainder;


          if (controller.withRemainder) {
            if (dalinys % number1*100 !== 0) {
              questionPool3.push([parseInt(number1 * number2 * 100) + remainder, parseInt(number1 * 100), "division"]);
            }
          } else {
            questionPool3.push([parseInt(number1 * number2 * 100) + remainder, parseInt(number1 * 100), "division"]);
          }
      
    }

      }
    questionPool2 = questionPool2.sort(() => 0.5 - Math.random()).slice(0, 10);
    questionPool3 = questionPool3.sort(() => 0.5 - Math.random()).slice(0, 10);
    controller.combinations = questionPool2.concat(questionPool3).sort(() => 0.5 - Math.random()).slice(0, 20);
  }
/*ALL*/
} else if (controller.modeChoice === "visi") {
  if (controller.modeChoice2 === "iki10") {
    for (let number1 = 1; number1 <= 9; number1++) {
      for (let number2 = 1; number2 <= 9; number2++) {
         if (number1 + number2 <= 10) {
          questionPool.push([parseInt(number1), parseInt(number2), "addition"]);
        }
      }
    }
    for (let number1 = 1; number1 <= 9; number1++) {
      for (let number2 = 1; number2 <= 9; number2++) {
         if (number1 > number2) {
          questionPool2.push([parseInt(number1), parseInt(number2), "subtraction"]);
        }
      }
    }
    questionPool = questionPool.sort(() => 0.5 - Math.random()).slice(0, 10);
    questionPool2 = questionPool2.sort(() => 0.5 - Math.random()).slice(0, 10);
    controller.combinations = questionPool.concat(questionPool2).sort(() => 0.5 - Math.random()).slice(0, 20);




  } else if (controller.modeChoice2 === "iki20") {


    for (let number1 = 11; number1 <= 19; number1++) {
      for (let number2 = 1; number2 <= 9; number2++) {
        if (11 <= number1 + number2 && number1 + number2 <= 19) {
          if (Math.random() < 0.5) {
            questionPool.push([parseInt(number1), parseInt(number2), "addition"]);
        } else {
            questionPool.push([parseInt(number2), parseInt(number1), "addition"]);
        }
    }
        }
      }

    for (let number1 = 1; number1 <= 9; number1++) {
      for (let number2 = 1; number2 <= 9; number2++) {
        if (11 <= number1 + number2 && number1 + number2 <= 19) {
          questionPool2.push([parseInt(number1), parseInt(number2), "addition"]);
        }
      }
    }


      for (let number1 = 11; number1 <= 19; number1++) {
        for (let number2 = 1; number2 <= 9; number2++) {
          if (parseInt(number1.toString()[1]) < number2) {
            questionPool3.push([parseInt(number1), parseInt(number2), "subtraction"]);
          }
        }
      }

      for (let number1 = 11; number1 <= 19; number1++) {
        for (let number2 = 1; number2 <= 9; number2++) {
          if (parseInt(number1.toString()[1]) > number2) {
            questionPool4.push([parseInt(number1), parseInt(number2), "subtraction"]);
          }
        }
      }


      let shuffledQuestionPool = questionPool.sort(() => 0.5 - Math.random()).slice(0, 2);
      let shuffledQuestionPool2 = questionPool2.sort(() => 0.5 - Math.random()).slice(0, 8);
      let combinedPool = shuffledQuestionPool.concat(shuffledQuestionPool2);

      let shuffledQuestionPool3 = questionPool3.sort(() => 0.5 - Math.random()).slice(0, 2);
      let shuffledQuestionPool4 = questionPool4.sort(() => 0.5 - Math.random()).slice(0, 8);
      let combinedPool2 = shuffledQuestionPool3.concat(shuffledQuestionPool4);

      controller.combinations = combinedPool.concat(combinedPool2).sort(() => 0.5 - Math.random()).slice(0, 20);

      

      
  } else if (controller.modeChoice2 === "iki100") {

    for (let number1 = 11; number1 <= 99; number1++) {
      for (let number2 = 11; number2 <= 99; number2++) {
        if (number1 + number2 <= 100) {
          
          const numStr1 = number1.toString();
          const numStr2 = number2.toString();

          const minDigits = Math.min(numStr1.length, numStr2.length);

          let neper = true;
          // Compare digits from the end of each number
          for (let i = 1; i <= minDigits; i++) {
            const digit1 = parseInt(numStr1[numStr1.length - i]);
            const digit2 = parseInt(numStr2[numStr2.length - i]);

            if (digit1 + digit2 >= 10) {
              neper = false
            }
          }
          if (neper) {
            if (Math.random() < 0.5) {
              questionPool.push([parseInt(number1), parseInt(number2), "addition"]);
          } else {
              questionPool.push([parseInt(number2), parseInt(number1), "addition"]);
          }

          }
        }


    }
        }
      

    for (let number1 = 11; number1 <= 99; number1++) {
      for (let number2 = 11; number2 <= 99; number2++) {
        if (number1 + number2 <= 100) {

          if (number1 + number2 <= 100) {
          
            const numStr1 = number1.toString();
            const numStr2 = number2.toString();
  
            const minDigits = Math.min(numStr1.length, numStr2.length);
  
            let neper = true;
            // Compare digits from the end of each number
            for (let i = 1; i <= minDigits; i++) {
              const digit1 = parseInt(numStr1[numStr1.length - i]);
              const digit2 = parseInt(numStr2[numStr2.length - i]);
  
              if (digit1 + digit2 >= 10) {
                neper = false
              }
            }
            if (!neper) {
              questionPool2.push([parseInt(number1), parseInt(number2), "addition"]);
  
            }
          }

        }
      }
    }


      for (let number1 = 11; number1 <= 99; number1++) {
        for (let number2 = 2; number2 <= 99; number2++) {
          if (number1 > number2) {

          const numStr1 = number1.toString();
          const numStr2 = number2.toString();

          const minDigits = Math.min(numStr1.length, numStr2.length);

          let neper = true;
          // Compare digits from the end of each number
          for (let i = 1; i <= minDigits; i++) {
            const digit1 = parseInt(numStr1[numStr1.length - i]);
            const digit2 = parseInt(numStr2[numStr2.length - i]);

            if (digit1 < digit2) {
              neper = false
            }
          }
          if (neper) {
            questionPool3.push([parseInt(number1), parseInt(number2), "subtraction"]);

          
        }
        }
      }
    }
      

      for (let number1 = 11; number1 <= 99; number1++) {
        for (let number2 = 2; number2 <= 99; number2++) {
          if (number1 > number2) {
            const numStr1 = number1.toString();
            const numStr2 = number2.toString();
  
            const minDigits = Math.min(numStr1.length, numStr2.length);
  
            let neper = true;
            // Compare digits from the end of each number
            for (let i = 1; i <= minDigits; i++) {
              const digit1 = parseInt(numStr1[numStr1.length - i]);
              const digit2 = parseInt(numStr2[numStr2.length - i]);
  
              if (digit1 < digit2) {
                neper = false
              }
            }
            if (!neper) {
              questionPool4.push([parseInt(number1), parseInt(number2), "subtraction"]);
          }
        }
        }
      }

      let shuffledQuestionPool = questionPool.sort(() => 0.5 - Math.random()).slice(0, 1);
      let shuffledQuestionPool2 = questionPool2.sort(() => 0.5 - Math.random()).slice(0, 4);
      let combinedPool = shuffledQuestionPool.concat(shuffledQuestionPool2);

      let shuffledQuestionPool3 = questionPool3.sort(() => 0.5 - Math.random()).slice(0, 1);
      let shuffledQuestionPool4 = questionPool4.sort(() => 0.5 - Math.random()).slice(0, 4);
      let combinedPool2 = shuffledQuestionPool3.concat(shuffledQuestionPool4);


    let combinedPool3 = [];
    for (let number1 = 2; number1 <= 9; number1++) {
      for (let number2 = 2; number2 <= 9; number2++) {
        if (number1 * number2 < 100) {
          combinedPool3.push([parseInt(number1), parseInt(number2), "multiplication"]);
      }
    }
  }

  let combinedPool4 = [];

  for (let number1 = 2; number1 <= 10; number1++) {
    for (let number2 = 2; number2 <= 10; number2++) {
      if (controller.withRemainder) {
        remainder = generateRandomNumber(1, number1)
      }
      if (controller.withRemainder) {
      if ((((number1 * number2) + remainder) % number1) !== 0) {
        combinedPool4.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
      }
    } else {
      combinedPool4.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
    }
  }
  }

    combinedPool3 = combinedPool3.sort(() => 0.5 - Math.random()).slice(0, 5);
    combinedPool4 = combinedPool4.sort(() => 0.5 - Math.random()).slice(0, 5);    

    controller.combinations = combinedPool.concat(combinedPool2, combinedPool3, combinedPool4).sort(() => 0.5 - Math.random()).slice(0, 20);
    } else if (controller.modeChoice2 === "iki1000") {

      while (questionPool.length < 1) {
        number1 = generateRandomNumber(101, 999);
        number2 = generateRandomNumber(11, 999);
          if (number1 + number2 < 1000) {
            const numStr1 = number1.toString();
            const numStr2 = number2.toString();
  
            const minDigits = Math.min(numStr1.length, numStr2.length);
  
            let neper = true;
            // Compare digits from the end of each number
            for (let i = 1; i <= minDigits; i++) {
              const digit1 = parseInt(numStr1[numStr1.length - i]);
              const digit2 = parseInt(numStr2[numStr2.length - i]);
  
              if (digit1 + digit2 >= 10) {
                neper = false
              }
            }
            if (neper) {
              if (Math.random() < 0.5) {
                questionPool.push([parseInt(number1), parseInt(number2), "addition"]);
            } else {
                questionPool.push([parseInt(number2), parseInt(number1), "addition"]);
            }
  
            }
      }
    }

    while (questionPool.length < 5) {
      number1 = generateRandomNumber(101, 999);
      number2 = generateRandomNumber(11, 999);
        if (number1 + number2 < 1000) {
          const numStr1 = number1.toString();
          const numStr2 = number2.toString();

          const minDigits = Math.min(numStr1.length, numStr2.length);

          let neper = true;
          // Compare digits from the end of each number
          for (let i = 1; i <= minDigits; i++) {
            const digit1 = parseInt(numStr1[numStr1.length - i]);
            const digit2 = parseInt(numStr2[numStr2.length - i]);

            if (digit1 + digit2 >= 10) {
              neper = false
            }
          }
          if (!neper) {
            questionPool.push([parseInt(number1), parseInt(number2), "addition"]);

          }
    }
  }

      while (questionPool2.length < 1) {
        number1 =generateRandomNumber(101, 999)
        number2 =generateRandomNumber(11, 999)
        if (number1 > number2) {
                    const numStr1 = number1.toString();
          const numStr2 = number2.toString();

          const minDigits = Math.min(numStr1.length, numStr2.length);

          let neper = true;
          // Compare digits from the end of each number
          for (let i = 1; i <= minDigits; i++) {
            const digit1 = parseInt(numStr1[numStr1.length - i]);
            const digit2 = parseInt(numStr2[numStr2.length - i]);

            if (digit1 < digit2) {
              neper = false
            }
          }
          if (neper) {
            questionPool2.push([parseInt(number1), parseInt(number2), "subtraction"]);

          
        }
    }
  }

  while (questionPool2.length < 5) {
    number1 =generateRandomNumber(101, 999)
    number2 =generateRandomNumber(11, 999)
    if (number1 > number2) {
      const numStr1 = number1.toString();
      const numStr2 = number2.toString();

      const minDigits = Math.min(numStr1.length, numStr2.length);

      let neper = true;
      // Compare digits from the end of each number
      for (let i = 1; i <= minDigits; i++) {
        const digit1 = parseInt(numStr1[numStr1.length - i]);
        const digit2 = parseInt(numStr2[numStr2.length - i]);

        if (digit1 < digit2) {
          neper = false
        }
      }
      if (!neper) {
        questionPool2.push([parseInt(number1), parseInt(number2), "subtraction"]);
    }
}
}

      while (questionPool3.length < 2) {
        interNumbers = [generateRandomNumber(11, 99), generateRandomNumber(2, 9)];
        number1 = Math.max(...interNumbers);
        number2 = Math.min(...interNumbers);
        if (number1 * number2 < 1000) {
        questionPool3.push([parseInt(number1), parseInt(number2), "multiplication"]);
        }
    }

    while (questionPool3.length < 5) {
      interNumbers = [generateRandomNumber(101, 999), generateRandomNumber(2, 9)];
      number1 = Math.max(...interNumbers);
      number2 = Math.min(...interNumbers);
      if (number1 * number2 < 1000) {
      questionPool3.push([parseInt(number1), parseInt(number2), "multiplication"]);
      }
  }
        while (questionPool4.length < 2) {
          let number1 = generateRandomNumber(2, 9);
          let number2 = generateRandomNumber(11, 99);
          if (controller.withRemainder) {
            remainder = generateRandomNumber(1, number1)
          }
          let dalinys = number1 * number2;

          if (dalinys < 1000 && Number(dalinys.toString()[dalinys.toString().length - 1]) !== 0) {
              questionPool4.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
        }
      }


      while (questionPool4.length < 4) {
        let number1 = generateRandomNumber(2, 9);
        let number2 = generateRandomNumber(101, 999);
        if (controller.withRemainder) {
          remainder = generateRandomNumber(1, number1)
        }
        let dalinys = number1 * number2;

        if (dalinys < 1000 && Number(dalinys.toString()[dalinys.toString().length - 1]) !== 0) {
            questionPool4.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
      }
    }


      let tens = [];
      let hundreds = [];
      for (let number1 = 2; number1 <= 10; number1++) {
        for (let number2 = 2; number2 <= 9; number2++) {
          if (number1 * number2 * 10 < 1000) {
            tens.push([parseInt(number1 * number2 * 10), parseInt(number1* 10), "division"]);
        }
      }
    }
        for (let number1 = 2; number1 <= 10; number1++) {
          for (let number2 = 2; number2 <= 9; number2++) {
            if (number1 * number2 * 100 < 1000) {
              hundreds.push([parseInt(number1 * number2 * 100), parseInt(number1 * 100), "division"]);
          }  
      }
    }
      
      let randomArray = Math.random() < 0.5 ? tens : hundreds;
      let randomIndex = Math.floor(Math.random() * randomArray.length);
      let randomElement = randomArray[randomIndex];
      questionPool4.push(randomElement);
  
      controller.combinations = questionPool.concat(questionPool2, questionPool3, questionPool4).sort(() => 0.5 - Math.random()).slice(0, 20);

      } else if (controller.modeChoice2 === "iki10000") {
      
        while (questionPool.length < 1) {
          number1 = generateRandomNumber(1001, 9999);
          number2 = generateRandomNumber(11, 9999);
            if (number1 + number2 < 10000) {
              const numStr1 = number1.toString();
              const numStr2 = number2.toString();
    
              const minDigits = Math.min(numStr1.length, numStr2.length);
    
              let neper = true;
              // Compare digits from the end of each number
              for (let i = 1; i <= minDigits; i++) {
                const digit1 = parseInt(numStr1[numStr1.length - i]);
                const digit2 = parseInt(numStr2[numStr2.length - i]);
    
                if (digit1 + digit2 >= 10) {
                  neper = false
                }
              }
              if (neper) {
                if (Math.random() < 0.5) {
                  questionPool.push([parseInt(number1), parseInt(number2), "addition"]);
              } else {
                  questionPool.push([parseInt(number2), parseInt(number1), "addition"]);
              }
    
              }
        }
      }
  
      while (questionPool.length < 3) {
        number1 = generateRandomNumber(1001, 9999);
        number2 = generateRandomNumber(11, 999);
          if (number1 + number2 < 10000) {
            const numStr1 = number1.toString();
            const numStr2 = number2.toString();
  
            const minDigits = Math.min(numStr1.length, numStr2.length);
  
            let neper = true;
            // Compare digits from the end of each number
            for (let i = 1; i <= minDigits; i++) {
              const digit1 = parseInt(numStr1[numStr1.length - i]);
              const digit2 = parseInt(numStr2[numStr2.length - i]);
  
              if (digit1 + digit2 >= 10) {
                neper = false
              }
            }
            if (!neper) {
              questionPool.push([parseInt(number1), parseInt(number2), "addition"]);
  
            }
      }
    }

    while (questionPool.length < 5) {
      number1 = generateRandomNumber(101, 9999);
      number2 = generateRandomNumber(11, 9999);
        if (number1 + number2 < 10000) {
          const numStr1 = number1.toString();
          const numStr2 = number2.toString();

          const minDigits = Math.min(numStr1.length, numStr2.length);

          let neper = true;
          // Compare digits from the end of each number
          for (let i = 1; i <= minDigits; i++) {
            const digit1 = parseInt(numStr1[numStr1.length - i]);
            const digit2 = parseInt(numStr2[numStr2.length - i]);

            if (digit1 + digit2 >= 10) {
              neper = false
            }
          }
          if (!neper) {
            questionPool.push([parseInt(number1), parseInt(number2), "addition"]);

          }
    }
  }
  
        while (questionPool2.length < 1) {
          number1 =generateRandomNumber(1001, 9999)
          number2 =generateRandomNumber(11, 9999)
          if (number1 > number2) {
                      const numStr1 = number1.toString();
            const numStr2 = number2.toString();
  
            const minDigits = Math.min(numStr1.length, numStr2.length);
  
            let neper = true;
            // Compare digits from the end of each number
            for (let i = 1; i <= minDigits; i++) {
              const digit1 = parseInt(numStr1[numStr1.length - i]);
              const digit2 = parseInt(numStr2[numStr2.length - i]);
  
              if (digit1 < digit2) {
                neper = false
              }
            }
            if (neper) {
              questionPool2.push([parseInt(number1), parseInt(number2), "subtraction"]);
  
            
          }
      }
    }
  
    while (questionPool2.length < 3) {
      number1 =generateRandomNumber(1001, 9999)
      number2 =generateRandomNumber(11, 999)
      if (number1 > number2) {
        const numStr1 = number1.toString();
        const numStr2 = number2.toString();
  
        const minDigits = Math.min(numStr1.length, numStr2.length);
  
        let neper = true;
        // Compare digits from the end of each number
        for (let i = 1; i <= minDigits; i++) {
          const digit1 = parseInt(numStr1[numStr1.length - i]);
          const digit2 = parseInt(numStr2[numStr2.length - i]);
  
          if (digit1 < digit2) {
            neper = false
          }
        }
        if (!neper) {
          questionPool2.push([parseInt(number1), parseInt(number2), "subtraction"]);
      }
  }
  }

  while (questionPool2.length < 5) {
    number1 =generateRandomNumber(1001, 9999)
    number2 =generateRandomNumber(11, 9999)
    if (number1 > number2) {
      const numStr1 = number1.toString();
      const numStr2 = number2.toString();

      const minDigits = Math.min(numStr1.length, numStr2.length);

      let neper = true;
      // Compare digits from the end of each number
      for (let i = 1; i <= minDigits; i++) {
        const digit1 = parseInt(numStr1[numStr1.length - i]);
        const digit2 = parseInt(numStr2[numStr2.length - i]);

        if (digit1 < digit2) {
          neper = false
        }
      }
      if (!neper) {
        questionPool2.push([parseInt(number1), parseInt(number2), "subtraction"]);
    }
}
}
  
        while (questionPool3.length < 2) {
          interNumbers = [generateRandomNumber(101, 9999), generateRandomNumber(2, 9)];
          number1 = Math.max(...interNumbers);
          number2 = Math.min(...interNumbers);
          if (number1 * number2 < 10000) {
          questionPool3.push([parseInt(number1), parseInt(number2), "multiplication"]);
          }
      }
  
      while (questionPool3.length < 5) {
        interNumbers = [generateRandomNumber(101, 9999), generateRandomNumber(11, 99)];
        number1 = Math.max(...interNumbers);
        number2 = Math.min(...interNumbers);
        if (number1 * number2 < 10000) {
        questionPool3.push([parseInt(number1), parseInt(number2), "multiplication"]);
        }
    }

          while (questionPool4.length < 2) {
            let number1 = generateRandomNumber(2, 9);
            let number2 = generateRandomNumber(11, 999);
            if (controller.withRemainder) {
              remainder = generateRandomNumber(1, number1)
            }
            let dalinys = number1 * number2;
  
            if (dalinys < 10000 && Number(dalinys.toString()[dalinys.toString().length - 1]) !== 0) {
                questionPool4.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
          }
        }
  
  
        while (questionPool4.length < 4) {
          let number1 = generateRandomNumber(2, 9);
          let number2 = generateRandomNumber(101, 9999);
          if (controller.withRemainder) {
            remainder = generateRandomNumber(1, number1)
          }
          let dalinys = number1 * number2;
  
          if (dalinys < 10000 && Number(dalinys.toString()[dalinys.toString().length - 1]) !== 0) {
              questionPool4.push([parseInt(number1 * number2) + remainder, parseInt(number1), "division"]);
        }
      }
  
        let tens = [];
        let hundreds = [];
        for (let number1 = 2; number1 <= 10; number1++) {
          for (let number2 = 2; number2 <= 9; number2++) {
            if (number1 * number2 * 10 < 10000) {
              tens.push([parseInt(number1 * number2 * 10), parseInt(number1* 10), "division"]);
          }
        }
      }
          for (let number1 = 2; number1 <= 10; number1++) {
            for (let number2 = 2; number2 <= 9; number2++) {
              if (number1 * number2 * 100 < 10000) {
                hundreds.push([parseInt(number1 * number2 * 100), parseInt(number1 * 100), "division"]);
            }  
        }
      }
        
        let randomArray = Math.random() < 0.5 ? tens : hundreds;
        let randomIndex = Math.floor(Math.random() * randomArray.length);
        let randomElement = randomArray[randomIndex];
        questionPool4.push(randomElement);
    
        controller.combinations = questionPool.concat(questionPool2, questionPool3, questionPool4).sort(() => 0.5 - Math.random()).slice(0, 20);
        }
  }
    }
  
function generateRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}