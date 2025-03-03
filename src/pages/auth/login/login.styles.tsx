import styled from '@emotion/styled'

export const LoginContainer = styled.div`
  width: 100vw;
  height: 100vh;
  background:
    linear-gradient(rgba(30, 27, 177, 0.5), rgba(5, 4, 75, 0.5)),
    url('/assets/images/background-school.png') center/cover no-repeat;
  background-size: cover;
  // background-image: linear-gradient(to bottom right, #7373e9, #16168d);
  display: flex;
  align-items: center;
  justify-content: center;
`
export const LoginCardContainer = styled.div`
  background-color: white;
  padding: 2rem;
  border-radius: 0.8rem;
  max-width: 60rem;
  width: 100%;
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  box-shadow: 0 0 1rem rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    flex-direction: column;
    padding: 2rem;
    text-align: center;
  }
`
export const LoginLeftContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  img {
    width: 22rem;
    height: auto;
    border-radius: 8px;
  }

  @media (max-width: 768px) {
    img {
      width: 18rem;
    }
  }
`
export const LoginRightContainer = styled.div`
  flex: 1;
  padding: 2rem 1rem;
  display: flex;
  flex-direction: column;
  justify-content: center;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`
