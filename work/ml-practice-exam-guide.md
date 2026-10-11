# 기계학습프로그래밍 실기 대비 정리

[HONGSAHUN/AI-Class](https://github.com/HONGSAHUN/AI-Class)의 2~5주차 실습을 실기 시험용으로 다시 정리한 문서야. 앞부분은 모든 실습에 공통으로 쓰는 필수 개념, 중간은 실습별 구현 과정, 끝은 시험장에서 바로 고쳐 쓸 수 있는 템플릿과 실수 체크리스트야.

- 기준: AI-Class 저장소 최신 커밋 `9654605` (2026-10-11 확인)
- 결과 숫자는 노트북에 저장된 실행 결과를 옮긴 것이야. `random_state`가 없는 실습은 다시 실행하면 숫자가 달라질 수 있어.
- 실기 시험의 시행 여부와 형식은 아직 공지로 확정되지 않았어. 수업 녹음 기준으로는 간단한 pass/fail 형식이고, 본인 GitHub를 참고 자료로 볼 수 있다고 했어.

## 목차

1. [실습 한눈에 보기](#1-실습-한눈에-보기)
2. [필수 개념](#2-필수-개념)
3. [실습별 구현 과정](#3-실습별-구현-과정)
4. [시험장용 템플릿](#4-시험장용-템플릿)
5. [자주 하는 실수 체크리스트](#5-자주-하는-실수-체크리스트)

---

## 1. 실습 한눈에 보기

| 주차 | 파일 | 데이터 | 문제 유형 | 핵심 기술 | 최고 결과 |
| --- | --- | --- | --- | --- | --- |
| 2 | `EX_0914.ipynb` | iris | 다중 분류 (3품종) | 기본 흐름, 모델 5개 | 4개 모델 정확도 93.33% |
| 2 | `EX_0914_diabetes_classification` | diabetes | 이진 분류 (Outcome) | `stratify`, 파이프라인 | Random Forest 75.97% |
| 2 | `EX_0914_diabetes_bmi_regression` | diabetes | 회귀 (BMI) | 열 두 개 제외, MAE·RMSE | Random Forest RMSE 6.91 |
| 2 | `EX_0914_wine_classification` | wine | 다중 분류 (3종류) | 모델 4개 비교 | Random Forest 100% |
| 2 | `EX_0914_wine_alcohol_regression` | wine | 회귀 (Alcohol) | Regressor 4개 | Random Forest RMSE 0.39 |
| 3 | `Report_0921_iris_EDA_sahun` | iris | EDA | 분포, 상관, IQR 이상치 | — |
| 3 | `Report_0921_wine_EDA_sahun` | wine | EDA | 단위 차이를 고려한 변수 선택 | — |
| 4 | `EX_0928_car_classification` | car.data | 다중 분류 (4등급, 불균형) | LabelEncoder vs 순서 인코딩, macro F1 | Tree macro F1 0.962 |
| 4 | `EX_0928_mpg_classification` | auto-mpg.data | 다중 분류 (연비 3등급) | 결측치 `?`, 원핫, `qcut` | Tree macro F1 0.898 |
| 4 | `EX_0928_digit_evaluation` | sklearn digits | 다중 분류 (0~9) | 이미지 → 1차원 벡터 | KNN 99.17% |
| 5 | `DL_diabetes` | diabetes | 이진 분류 (딥러닝) | sigmoid + BCE | 정확도 72.08% |
| 5 | `DL_wine` | wine | 다중 분류 (딥러닝) | softmax + CCE, 원핫 | 정확도 97.22% |
| 5 | `Report_1005_202138150.xlsx` | — | 손계산 | 퍼셉트론 AND·OR·다층 계산 | — |

---

## 2. 필수 개념

### 2.1 모든 실습은 같은 5단계를 따른다

| 단계 | 하는 일 | 코드 |
| --- | --- | --- |
| ① 데이터 수집 | 파일 읽기 | `pd.read_csv(...)` |
| ② 전처리 | 결측치·불필요한 열 처리, 인코딩, X/y 분리, 훈련/시험 분할, 스케일링 | `drop`, `dropna`, `LabelEncoder`, `train_test_split`, `StandardScaler` |
| ③ 모델 구성 | 문제에 맞는 모델 고르기 | `model = RandomForestClassifier(...)` |
| ④ 학습 | 훈련 데이터로 규칙 찾기 | `model.fit(X_train, y_train)` |
| ⑤ 평가 | 시험 데이터로 예측하고 정답과 비교 | `y_pred = model.predict(X_test)` → `accuracy_score(y_test, y_pred)` |

가장 중요한 세 줄은 이거야.

```python
model.fit(X_train, y_train)        # 입력과 정답으로 학습
y_pred = model.predict(X_test)     # 시험 입력만 보고 예측
accuracy_score(y_test, y_pred)     # 실제 정답과 비교해서 채점
```

### 2.2 데이터 읽기

| 상황 | 코드 | 나온 실습 |
| --- | --- | --- |
| 일반 CSV | `pd.read_csv("wine.csv")` | 대부분 |
| 열 이름이 없는 파일 | `pd.read_csv("car.data", header=None)` 후 `df.columns = [...]` | car |
| 공백 구분 + 결측치가 `?` | `pd.read_csv("auto-mpg.data", sep=r"\s+", header=None, na_values="?")` | mpg |
| 코랩에서 파일 직접 올리기 | `from google.colab import files` → `files.upload()` | 2·4주차 |
| 구글 드라이브에서 읽기 | `drive.mount('/content/drive')` → `/content/drive/MyDrive/Colab Notebooks/파일명` | iris, 5주차 |

읽은 직후에는 항상 이 세 줄로 확인해.

```python
print(df.shape)              # (행 수, 열 수)
print(df.head())             # 처음 5행
print(df.isnull().sum())     # 열별 결측치 개수
```

### 2.3 입력 X와 정답 y 나누기

```python
X = df.drop("Outcome", axis=1)   # axis=1 → 열을 지운다
y = df["Outcome"]
```

- `axis=1`은 열, `axis=0`은 행이야. 열을 지울 때 `axis=1`을 빼먹으면 오류가 나.
- `drop`은 원본 `df`를 바꾸지 않고 새 표를 돌려줘.
- 여러 열을 빼려면 리스트로 줘: `df.drop(["Outcome", "BMI"], axis=1)`.
- 회귀에서 정답으로 쓰는 열은 반드시 입력에서 빼야 해. 빼지 않으면 정답을 보고 정답을 맞히는 꼴이야.

### 2.4 훈련/시험 분할

```python
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)
```

| 인자 | 의미 | 주의 |
| --- | --- | --- |
| `test_size=0.2` | 20%를 시험용으로 | |
| `random_state=42` | 실행할 때마다 같은 분할 | 없으면 실행마다 결과가 달라짐 |
| `stratify=y` | 클래스 비율을 훈련·시험에 똑같이 유지 | **분류에만** 사용. 회귀(연속값)에는 쓰지 않음 |

나누는 이유는 **일반화 성능**, 즉 처음 보는 데이터에서도 잘 맞히는지를 재기 위해서야. 반환 순서는 `X_train, X_test, y_train, y_test`로 고정이니 외워 둬.

### 2.5 분류 vs 회귀

| | 분류 | 회귀 |
| --- | --- | --- |
| 정답 | 범주 (품종, 등급, 0/1) | 연속 숫자 (BMI, 알코올 도수) |
| 모델 이름 | `...Classifier`, `LogisticRegression`, `SVC` | `...Regressor`, `LinearRegression` |
| 평가 | `accuracy_score`, `classification_report`, `f1_score` | `mean_absolute_error`, `mean_squared_error` |
| `stratify` | 사용 | 사용 안 함 |

`LogisticRegression`은 이름에 Regression이 있지만 **분류 모델**이야.

### 2.6 스케일링 (StandardScaler)

표준화는 각 특성을 평균 0, 표준편차 1로 맞추는 거야. 와인 데이터처럼 `Proline`은 수백, `Hue`는 1 근처로 단위가 다를 때 필요해.

```python
scaler = StandardScaler()
X_train_s = scaler.fit_transform(X_train)   # 훈련 데이터로 평균·표준편차를 구하고 변환
X_test_s  = scaler.transform(X_test)        # 시험 데이터는 그 기준으로 변환만
```

- **시험 데이터에 `fit`하면 안 돼.** 시험 데이터 정보가 학습에 섞이는 데이터 누수가 생겨.
- `make_pipeline(StandardScaler(), KNeighborsClassifier())`로 묶으면 `fit`할 때 자동으로 훈련 데이터에만 맞춰 줘. 2주차 실습은 이 방식을 썼어.

| 스케일링이 중요한 모델 | 스케일링 영향이 작은 모델 |
| --- | --- |
| KNN, SVM, 로지스틱 회귀, 딥러닝 (거리·가중합 계산) | 결정 트리, 랜덤 포레스트 (값의 대소로만 분할) |

### 2.7 문자형 데이터 인코딩

모델은 숫자만 계산할 수 있어서 문자 열은 숫자로 바꿔야 해.

| 방법 | 코드 | 언제 | 나온 실습 |
| --- | --- | --- | --- |
| LabelEncoder | `LabelEncoder().fit_transform(df[col])` | 정답 y, 또는 빠르게 숫자로 바꿀 때 | car, mpg |
| 순서 지정 매핑 | `df[col].map({'low':0, 'med':1, 'high':2})` | 크기 순서가 있는 입력 (low < med < high) | car |
| 원핫 인코딩 | `pd.get_dummies(df, columns=['origin'], dtype=int)` | 순서가 없는 범주형 입력 (국가) | mpg |
| 딥러닝 정답 원핫 | `tf.keras.utils.to_categorical(y, num_classes=3)` | 딥러닝 다중 분류 정답 | DL_wine |

**LabelEncoder의 함정**: 알파벳 순서로 번호를 매겨. car 실습에서 `price`가 `high=0, low=1, med=2, vhigh=3`이 되어 실제 크기 순서가 깨졌어. 순서를 직접 지정하자 SVM의 macro F1이 0.714에서 0.963으로 올랐어.

### 2.8 평가 지표

**분류**

```python
accuracy_score(y_test, y_pred)                       # 정확도
f1_score(y_test, y_pred, average="macro")            # macro F1 (불균형 데이터에서 중요)
classification_report(y_test, y_pred, zero_division=0)
confusion_matrix(y_test, y_pred)                     # 혼동행렬 (행 = 실제, 열 = 예측)
ConfusionMatrixDisplay.from_predictions(y_test, y_pred)  # 혼동행렬 그림
```

`classification_report` 읽는 법:

| 항목 | 뜻 |
| --- | --- |
| precision | 그 클래스라고 예측한 것 중 맞은 비율 = TP / (TP + FP) |
| recall | 실제 그 클래스 중 찾아낸 비율 = TP / (TP + FN) |
| f1-score | 2PR / (P + R) |
| support | 시험 데이터에서 그 클래스의 실제 개수 |
| macro avg | 클래스별 점수의 단순 평균 → 소수 클래스 문제가 드러남 |
| weighted avg | support로 가중한 평균 → 다수 클래스에 끌려감 |

**회귀**

```python
mae  = mean_absolute_error(y_test, y_pred)    # 오차 절댓값 평균
mse  = mean_squared_error(y_test, y_pred)     # 오차 제곱 평균
rmse = mse ** 0.5                              # MSE의 제곱근 = 정답과 같은 단위
```

셋 다 **작을수록 좋아.** BMI 예측의 RMSE 10.2는 BMI와 같은 단위로 나타낸 오차 크기야. 10.2%라는 뜻도, 모든 사람을 정확히 10.2씩 틀렸다는 뜻도 아니야.

### 2.9 딥러닝 (Keras) 기본 구조

```python
model = tf.keras.Sequential([
    tf.keras.Input(shape=(13,)),                     # 입력 특성 수 (정답 열 제외)
    tf.keras.layers.Dense(32, activation="relu"),    # 32 = 이 층의 뉴런 수
    tf.keras.layers.Dense(16, activation="relu"),
    tf.keras.layers.Dense(3, activation="softmax")   # 출력층
])
model.compile(optimizer="adam", loss="categorical_crossentropy", metrics=["accuracy"])
model.summary()
history = model.fit(X_train, y_train_onehot, epochs=100, batch_size=32, validation_split=0.2)
```

**출력층은 문제 유형으로 정해져.**

| 문제 | 출력 뉴런 | 활성화 | 손실 함수 | 예측값 만들기 |
| --- | --- | --- | --- | --- |
| 이진 분류 | 1 | `sigmoid` | `binary_crossentropy` | `(y_prob >= 0.5).astype(int).flatten()` |
| 다중 분류 (정답 원핫) | 클래스 수 | `softmax` | `categorical_crossentropy` | `np.argmax(y_prob, axis=1)` |
| 다중 분류 (정답 정수) | 클래스 수 | `softmax` | `sparse_categorical_crossentropy` | `np.argmax(y_prob, axis=1)` |
| 회귀 | 1 | 없음 (linear) | `mse` | `model.predict(X_test).flatten()` |

**파라미터 수 = (입력 수 × 뉴런 수) + 뉴런 수.** `model.summary()`의 Param # 와 같아야 해.

| 층 | DL_diabetes (입력 8) | DL_wine (입력 13) |
| --- | --- | --- |
| Dense(32) | 8 × 32 + 32 = 288 | 13 × 32 + 32 = 448 |
| Dense(16) | 32 × 16 + 16 = 528 | 32 × 16 + 16 = 528 |
| 출력 | 16 × 1 + 1 = 17 | 16 × 3 + 3 = 51 |
| 합계 | 833 | 1,027 |

| `fit` 인자 | 뜻 |
| --- | --- |
| `epochs=100` | 훈련 데이터 전체를 100번 반복 학습 |
| `batch_size=32` | 32개씩 묶어서 가중치를 한 번 갱신 (미니배치) |
| `validation_split=0.2` | 훈련 데이터의 20%를 떼어 매 에포크 검증 (`val_loss`, `val_accuracy`) |

### 2.10 코랩에서 생기는 문제

- **셀은 변수를 공유해.** 아래쪽 셀에서 `X_train`을 다른 데이터로 덮어쓰고 위쪽 셀만 다시 실행하면, 위쪽 셀도 바뀐 데이터를 써. 화면 위치보다 실행 순서가 중요해. 막히면 "런타임 → 모두 실행"으로 처음부터 다시 돌려.
- **모델을 바꾸면 `predict`도 다시 해야 해.** `fit`만 하고 예전 `y_pred`로 채점하면 모든 모델 점수가 똑같이 나와.
- GitHub에 올리기: 코랩 "파일 → GitHub에 사본 저장", 안 되면 `.ipynb` 다운로드 후 저장소에서 "Add file → Upload files".

---

## 3. 실습별 구현 과정

각 실습은 **목표 → 단계별 핵심 코드 → 결과 → 포인트** 순서로 정리했어.

### 3.1 [2주차] iris 분류 — `EX_0914.ipynb`

**목표**: 꽃받침·꽃잎의 길이와 너비 4개로 붓꽃 품종 3개를 분류.

1. 데이터 읽기: `df = pd.read_csv(".../iris.csv")` → 150행 × 5열
2. X/y 분리: `X = df.drop("species", axis=1)`, `y = df["species"]`
3. 분할: `train_test_split(X, y, test_size=0.2)` → 훈련 120, 시험 30
4. 모델마다 `fit` → `predict` → `accuracy_score`
5. 산점도: `sns.scatterplot(data=df, x='sepal_length_cm', y='sepal_width_cm', hue='species')`

**결과 (저장된 실행)**

| 모델 | 정확도 |
| --- | --- |
| Decision Tree | 93% (classification_report 기준) |
| Random Forest | 93.33% |
| Logistic Regression (`max_iter=200`) | 93.33% |
| SVM (`SVC()`) | 93.33% |
| KNN | 93.33% |

**포인트**
- 이 노트북은 `random_state`와 `stratify`가 없어. 그래서 시험 데이터의 setosa가 7개뿐이었고, 다시 실행하면 정확도가 바뀌어. 실기에서는 `random_state=42, stratify=y`를 넣는 게 안전해.
- 정답 `species`가 문자열이어도 scikit-learn 분류 모델은 그대로 학습할 수 있어.

### 3.2 [2주차] diabetes 이진 분류 — `EX_0914_diabetes_classification.ipynb`

**목표**: 8개 건강 지표로 당뇨 여부 `Outcome`(0/1)을 분류.

1. 데이터: 768행 × 9열. `Outcome` 0이 500개, 1이 268개로 약간 불균형.
2. X/y 분리 후 `stratify=y`로 분할 → 훈련 (614, 8), 시험 (154, 8)
3. 모델 4개를 딕셔너리에 담고, KNN과 로지스틱 회귀는 `make_pipeline(StandardScaler(), ...)`로 스케일링
4. `for name, model in models.items():` 안에서 학습·예측·리포트 출력, 결과를 리스트에 모아 표로 출력

**결과**

| 모델 | 정확도 | 맞힌 개수 / 154 | 클래스 1 recall |
| --- | --- | --- | --- |
| Random Forest | 75.97% | 117 | 0.59 |
| Decision Tree | 72.73% | 112 | 0.50 |
| Logistic Regression | 71.43% | 110 | 0.52 |
| KNN | 70.13% | 108 | 0.52 |

**포인트**: 정확도는 70%대지만 당뇨 환자(클래스 1)의 recall은 0.5~0.6이야. 환자 절반 가까이를 놓친다는 뜻이라, 의료 데이터에서는 정확도만 보면 안 돼.

### 3.3 [2주차] diabetes BMI 회귀 — `EX_0914_diabetes_bmi_regression.ipynb`

**목표**: 나머지 지표로 BMI 수치를 예측.

```python
y = df["BMI"]
X = df.drop("Outcome", axis=1)
X = X.drop("BMI", axis=1)          # 두 번째 drop은 df가 아니라 X에 적용
```

- 입력 7개: Pregnancies, Glucose, BloodPressure, SkinThickness, Insulin, DiabetesPedigreeFunction, Age
- `stratify` 없이 분할 (회귀이므로)
- Regressor 3개로 MAE·RMSE 비교, `comparison` 표에 실제값과 모델별 예측값을 나란히 저장

**결과**

| 모델 | MAE | RMSE |
| --- | --- | --- |
| Random Forest | 5.2111 | 6.9072 |
| Linear Regression | 5.2110 | 7.2278 |
| Decision Tree | 7.2513 | 10.2043 |

**포인트**: 결정 트리 하나는 훈련 데이터에 과적합되기 쉬운 모델이고, 실제로 오차가 가장 컸어. 트리 여러 개를 평균하는 랜덤 포레스트는 RMSE가 가장 낮았어.

### 3.4 [2주차] wine 분류 — `EX_0914_wine_classification.ipynb`

**목표**: 13개 화학 성분으로 와인 종류 3개(`Wine` = 1, 2, 3)를 분류.

1. 데이터: 178행 × 14열. 종류별 59 / 71 / 48개
2. `X = df.drop("Wine", axis=1)` → 입력 13개, `stratify=y`로 분할 → 훈련 142, 시험 36
3. 3.2와 같은 모델 4개, 같은 반복문

**결과**

| 모델 | 정확도 | 맞힌 개수 / 36 |
| --- | --- | --- |
| Random Forest | 100% | 36 |
| KNN (스케일링) | 97.22% | 35 |
| Logistic Regression (스케일링) | 97.22% | 35 |
| Decision Tree | 94.44% | 34 |

### 3.5 [2주차] wine 알코올 회귀 — `EX_0914_wine_alcohol_regression.ipynb`

**목표**: `Alcohol` 수치를 나머지 성분으로 예측.

```python
y = df["Alcohol"]
X = df.drop("Wine", axis=1)
X = X.drop("Alcohol", axis=1)      # 입력 12개
```

**결과**

| 모델 | MAE | RMSE |
| --- | --- | --- |
| Random Forest | 0.3159 | 0.3928 |
| KNN (스케일링) | 0.3140 | 0.4152 |
| Linear Regression | 0.3675 | 0.4309 |
| Decision Tree | 0.4383 | 0.5585 |

**포인트**: MAE는 KNN이, RMSE는 랜덤 포레스트가 가장 낮아. RMSE는 큰 오차에 더 민감하니, 랜덤 포레스트가 크게 틀리는 경우가 더 적었다는 뜻이야. 지표마다 1등이 다를 수 있어.

### 3.6 [3주차] iris EDA — `Report_0921_iris_EDA_sahun.ipynb`

**목표**: 모델링 전에 데이터의 구조, 품질, 분포, 관계를 확인.

**EDA 흐름**: 구조 확인 → 품질 확인 → 레이블 확인 → 기술통계 → 분포 → 품종별 비교 → 변수 관계 → 상관관계 → 이상치

| 단계 | 코드 | iris 결과 |
| --- | --- | --- |
| 구조 | `df.shape`, `df.dtypes`, `df.info()` | (150, 5), 수치 4개 + 문자 1개 |
| 결측치·중복 | `df.isnull().sum()`, `df.duplicated().sum()` | 결측치 0, 중복 행 1 |
| 레이블 개수 | `df[target_col].value_counts()`, `sns.countplot` | 품종마다 50개 (균형) |
| 기술통계 | `df[numeric_cols].describe()` | 평균·표준편차·사분위수 |
| 품종별 통계 | `df.groupby(target_col)[numeric_cols].mean()` | petal 길이: setosa 1.46, virginica 5.55 |
| 분포 | `sns.histplot(..., kde=True)`, `hue=target_col` | |
| 박스·바이올린 | `sns.boxplot`, `sns.violinplot(inner="quartile")` | |
| 쌍별 관계 | `sns.pairplot(df, vars=numeric_cols, hue=target_col)` | |
| 상관관계 | `corr = df[numeric_cols].corr()`, `sns.heatmap(corr, annot=True, fmt=".2f")` | petal 길이–너비 0.963 |
| 이상치 | IQR 계산 (아래 코드) | sepal_width 4개 (2.0, 4.1, 4.2, 4.4) |

```python
for col in numeric_cols:
    Q1 = df[col].quantile(0.25)
    Q3 = df[col].quantile(0.75)
    IQR = Q3 - Q1
    lower = Q1 - 1.5 * IQR
    upper = Q3 + 1.5 * IQR
    outliers = df[(df[col] < lower) | (df[col] > upper)]
    print(f"{col:20s} : {len(outliers)}개 (Lower={lower:.2f}, Upper={upper:.2f})")
```

**포인트**: 꽃잎(petal) 변수는 품종이 뚜렷하게 나뉘고, 꽃받침(sepal) 변수는 많이 겹쳐. 이상치 후보는 원인을 확인하기 전에는 바로 지우지 않아.

### 3.7 [3주차] wine EDA — `Report_0921_wine_EDA_sahun.ipynb`

iris EDA 코드를 와인 데이터에 맞게 고친 실습이야.

- 결측치 0, 중복 0, 클래스 59 / 71 / 48 (심한 불균형 아님)
- 변수 단위 차이가 커 (Proline 평균 약 747, Hue 약 0.96) → 모델링 때 표준화 필요
- 이상치 후보는 변수당 0~4개로 적어서 유지

**핵심 수정: 단위를 고려한 변수 선택**

```python
group_means = df.groupby(target_col)[numeric_cols].mean()
# 수정 전: 평균 차이 그대로 → 값이 큰 변수(Proline, Mg)가 뽑힘
# 수정 후: 평균 차이를 전체 표준편차로 나눔
feature_spread = (group_means.max() - group_means.min()) / df[numeric_cols].std()
plot_cols = feature_spread.sort_values(ascending=False).head(4).index.tolist()
```

| 변수 | 수정 전 순위 | 수정 후 순위 |
| --- | --- | --- |
| Flavanoids | 5 | 1 |
| OD | 6 | 2 |
| Proline | 1 | 3 |
| Color.int | 4 | 4 |
| Mg | 2 | 12 |

**결론**: 와인 종류를 가르는 핵심 변수는 Flavanoids, OD, Proline, Color.int, Alcohol이야. Flavanoids는 Phenols(0.87), OD(0.79)와 상관이 강해서 정보가 겹쳐. 단위가 다른 변수를 비교할 땐 스케일을 맞춰야 한다는 게 이 실습의 교훈이고, 머신러닝에서 StandardScaler를 쓰는 이유와 같아.

### 3.8 [4주차] car 분류 — `EX_0928_car_classification.ipynb`

**목표**: 가격·유지비·문 수·인원·트렁크·안전도로 구매 적합도 4등급을 분류. **모든 열이 문자형**이야.

1. 열 이름이 없으므로 `header=None`으로 읽고 이름 지정 → (1728, 7)
2. 정답 분포: unacc 1210, acc 384, good 69, vgood 65 → unacc가 약 70%인 **불균형 데이터**라 macro F1도 확인
3. 모든 열에 LabelEncoder, 인코더는 딕셔너리에 저장 (나중에 클래스 이름 복원용)

```python
label_encoders = {}
for column in df.columns:
    label_encoders[column] = LabelEncoder()
    df[column] = label_encoders[column].fit_transform(df[column])
```

4. `.values`로 numpy 배열 변환 → `stratify=y` 분할 → StandardScaler (훈련에만 fit)
5. `compare()` 함수로 모델 5개의 accuracy와 macro F1을 표로 비교
6. 최고 모델의 `classification_report(target_names=out_le.classes_)`와 혼동행렬 그림
7. 입력을 실제 크기 순서로 `map`해서 다시 비교

**결과 (macro F1)**

| 모델 | LabelEncoder | 순서 지정 |
| --- | --- | --- |
| Random Forest | 0.961 | 0.986 |
| Decision Tree | 0.962 | 0.976 |
| SVM | 0.714 | 0.963 |
| KNN | 0.839 | 0.867 |
| Logistic | 0.275 | 0.673 |

**포인트**
- 로지스틱 회귀는 정확도 0.688인데 macro F1은 0.275야. unacc 비율(약 70%)과 정확도가 거의 같아서, 대부분을 unacc로 예측했을 가능성이 커. 불균형 데이터에서 정확도가 착시를 주는 예시야.
- SVM·로지스틱은 숫자의 크기와 거리를 그대로 쓰니 순서 인코딩의 효과가 컸고, 트리 계열은 차이가 작았어.
- 정답 열은 순서 의미가 없으니 LabelEncoder로 충분해.

### 3.9 [4주차] auto-mpg 분류 — `EX_0928_mpg_classification.ipynb`

**목표**: 실린더·배기량·마력·무게 등으로 연비 등급 3개(low / mid / high)를 분류. 원래 회귀 데이터를 분류 문제로 바꾼 실습이야.

```python
df = pd.read_csv("auto-mpg.data", sep=r"\s+", header=None, na_values="?")
df.columns = ['mpg', 'cylinders', 'displacement', 'horsepower', 'weight',
              'acceleration', 'model_year', 'origin', 'car_name']
df = df.drop('car_name', axis=1)          # 차마다 다른 이름 → 의미 없는 열
df = df.dropna()                           # horsepower 결측치 6행 삭제 → 392행
df = pd.get_dummies(df, columns=['origin'], prefix='origin', dtype=int)   # 1·2·3은 크기가 아닌 국가
df['grade'] = pd.qcut(df['mpg'], q=3, labels=['low', 'mid', 'high']).astype(str)  # 개수가 같은 3구간
X = df.drop(['mpg', 'grade'], axis=1).values    # grade를 mpg로 만들었으니 mpg도 입력에서 제외
```

**결과 (macro F1)**: Tree 0.898, SVM 0.846, KNN 0.835, Logistic 0.821, Forest 0.806

**포인트**
- `mpg`를 입력에 남기면 정답을 만든 열로 정답을 맞히는 셈이라 반드시 빼야 해.
- 오분류는 모두 mid와 인접 등급 사이에서 생겼고 high–low 혼동은 없었어.
- 시험 데이터가 79개라 분할에 따라 순위가 바뀔 수 있어.

### 3.10 [4주차] 손글씨 숫자 분류 — `EX_0928_digit_evaluation.ipynb`

**목표**: 8 × 8 흑백 이미지를 0~9로 분류.

```python
digits = datasets.load_digits()
n_samples = len(digits.images)
data = digits.images.reshape((n_samples, -1))   # (1797, 8, 8) → (1797, 64)
knn = KNeighborsClassifier(n_neighbors=4)
```

- `reshape((n_samples, -1))`는 이미지 한 장을 64개 값의 1차원 벡터로 펴는 것(평탄화)이야. 모델은 샘플 하나를 1차원 특성 벡터로 받기 때문이야.
- 한 장만 예측할 때도 2차원으로 넣어야 해: `knn.predict([X_test[10]])`
- 이미지 보기: `plt.imshow(X_test[10].reshape(8, 8), cmap=plt.cm.gray_r)`

**결과**: KNN 0.9917, Random Forest 0.9750, Logistic Regression 0.9556, Decision Tree 0.8583 (분할에 `random_state`가 없어 재실행 시 변동)

### 3.11 [5주차] 딥러닝 diabetes 이진 분류 — `DL_diabetes.ipynb`

```python
X = df.drop("Outcome", axis=1).values
y = df["Outcome"].values
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

scaler = StandardScaler()
X_train = scaler.fit_transform(X_train)
X_test = scaler.transform(X_test)

model = tf.keras.Sequential()
model.add(tf.keras.layers.Dense(32, activation="relu", input_shape=(8,)))
model.add(tf.keras.layers.Dense(16, activation="relu"))
model.add(tf.keras.layers.Dense(1, activation="sigmoid"))
model.compile(optimizer="adam", loss="binary_crossentropy", metrics=["accuracy"])

history = model.fit(X_train, y_train, epochs=100, batch_size=32, validation_split=0.2)

y_prob = model.predict(X_test)                       # 0~1 확률
y_pred = (y_prob >= 0.5).astype(int).flatten()       # 0.5 기준으로 0/1
```

**결과**: 정확도 72.08%, 파라미터 833개

```
Confusion Matrix        클래스 1: precision 0.60, recall 0.63
[[77 23]
 [20 34]]
```

**포인트**
- `input_shape=(8,)`의 8은 9개 열에서 Outcome을 뺀 값이야.
- Keras가 `input_shape` 대신 `tf.keras.Input(shape=(8,))`을 첫 층으로 쓰라는 경고를 냈어. 동작은 같고, DL_wine처럼 `Input`을 쓰면 경고가 사라져.
- 노트북에서 `compile`을 두 번 실행했는데 결과에는 영향 없어.
- 2주차 머신러닝 모델(70~76%)과 비슷한 수준이야. 데이터가 작으면 딥러닝이 항상 더 좋지는 않아.

### 3.12 [5주차] 딥러닝 wine 다중 분류 — `DL_wine.ipynb`

```python
X = df.drop("Wine", axis=1).values
y = df["Wine"].values.astype(int) - 1      # 1,2,3 → 0,1,2

# 분할, 표준화는 DL_diabetes와 같음
y_train_onehot = tf.keras.utils.to_categorical(y_train, num_classes=3)   # 0 → [1,0,0]

model = tf.keras.Sequential([
    tf.keras.Input(shape=(13,)),
    tf.keras.layers.Dense(32, activation="relu"),
    tf.keras.layers.Dense(16, activation="relu"),
    tf.keras.layers.Dense(3, activation="softmax")
])
model.compile(optimizer="adam", loss="categorical_crossentropy", metrics=["accuracy"])
history = model.fit(X_train, y_train_onehot, epochs=100, batch_size=32, validation_split=0.2)

y_prob = model(X_test, training=False).numpy()   # model.predict(X_test)도 가능
y_pred = np.argmax(y_prob, axis=1)               # 확률이 가장 큰 클래스 번호
```

**결과**: 정확도 97.22%, 파라미터 1,027개, Wine 3 하나를 Wine 2로 오분류

**포인트**
- **1을 빼는 이유**: `to_categorical`은 0부터 시작하는 정수를 받아. 1, 2, 3을 그대로 넣으면 길이 4짜리 벡터가 생겨 출력층 3개와 맞지 않아.
- 원핫은 학습용 정답(`y_train`)에만 했고, 평가는 정수 `y_test`와 `argmax` 결과를 비교했어.
- 표준화는 입력 X를, 원핫은 정답 y를 바꾸는 거라 서로 대신할 수 없어.

### 3.13 [5주차] 퍼셉트론 손계산 — `Report_1005_202138150.xlsx`

| 문항 | 내용 |
| --- | --- |
| 1 | 은닉 뉴런 2개 + 출력 뉴런 1개의 다층 퍼셉트론을 네 입력에 대해 계산 |
| 2 | w = (1, 1), b = −1.5에 (0, 0)을 넣으면 z = −1.5 → 출력 0 (AND 퍼셉트론) |
| 3 | 바이어스를 −0.5로 바꾸면 (0,0)만 0이고 나머지는 1 → OR처럼 동작 |

**계산 순서**: 가중합 → 바이어스 더하기 → 활성화 함수(계단: z > 0이면 1).

**확인이 필요한 부분**: 1번 표의 계산대로라면 첫 번째 은닉 뉴런이 네 입력 모두에서 1이고, 출력이 1 × y1 + 1 × y2 + 0.5라서 네 입력 모두 최종 출력이 1이야. 문제에서 XOR 같은 특정 연산을 기대했다면 주어진 가중치와 바이어스를 다시 확인해 봐.

---

## 4. 시험장용 템플릿

파일 이름과 열 이름만 바꾸면 돼. 4.1·4.2·4.3은 sklearn 내장 wine 데이터로 실행해서 노트북과 같은 결과가 나오는 것을 확인했어. 4.4는 5주차 노트북에서 실행된 코드를 바탕으로 정리했어.

### 4.1 분류 모델 비교

```python
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import make_pipeline
from sklearn.neighbors import KNeighborsClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, f1_score, classification_report

df = pd.read_csv("wine.csv")          # 파일 이름
target = "Wine"                        # 정답 열 이름

X = df.drop(target, axis=1)
y = df[target]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

models = {
    "KNN": make_pipeline(StandardScaler(), KNeighborsClassifier()),
    "Decision Tree": DecisionTreeClassifier(random_state=42),
    "Random Forest": RandomForestClassifier(random_state=42),
    "Logistic Regression": make_pipeline(StandardScaler(), LogisticRegression(max_iter=1000)),
}

results = []
for name, model in models.items():
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)          # 모델마다 다시 예측
    results.append({
        "모델": name,
        "정확도": accuracy_score(y_test, y_pred),
        "macro F1": f1_score(y_test, y_pred, average="macro"),
    })
    print(f"\n===== {name} =====")
    print(classification_report(y_test, y_pred, zero_division=0))

print(pd.DataFrame(results).round(4).to_string(index=False))
```

### 4.2 회귀 모델 비교

```python
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import make_pipeline
from sklearn.tree import DecisionTreeRegressor
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.neighbors import KNeighborsRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error

df = pd.read_csv("wine.csv")
target = "Alcohol"                       # 예측할 수치 열
drop_cols = ["Wine", "Alcohol"]          # 입력에서 뺄 열 (정답 포함)

X = df.drop(drop_cols, axis=1)
y = df[target]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42      # 회귀에는 stratify를 쓰지 않음
)

models = {
    "Decision Tree": DecisionTreeRegressor(random_state=42),
    "Random Forest": RandomForestRegressor(random_state=42),
    "Linear Regression": LinearRegression(),
    "KNN": make_pipeline(StandardScaler(), KNeighborsRegressor()),
}

results = []
for name, model in models.items():
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)
    mse = mean_squared_error(y_test, y_pred)
    results.append({
        "모델": name,
        "MAE": mean_absolute_error(y_test, y_pred),
        "MSE": mse,
        "RMSE": mse ** 0.5,
    })

print(pd.DataFrame(results).round(4).to_string(index=False))
```

### 4.3 최소 EDA

`display()`는 코랩·주피터에서만 동작해. 일반 파이썬 파일이면 `print()`로 바꿔.

```python
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

df = pd.read_csv("wine.csv")
target_col = "Wine"
numeric_cols = [c for c in df.columns if c != target_col]

print(df.shape)
print(df.isnull().sum())
print(df.duplicated().sum())
print(df[target_col].value_counts())
display(df[numeric_cols].describe().round(3))
display(df.groupby(target_col)[numeric_cols].mean().round(3))

for col in numeric_cols:
    q1, q3 = df[col].quantile(0.25), df[col].quantile(0.75)
    iqr = q3 - q1
    lower, upper = q1 - 1.5 * iqr, q3 + 1.5 * iqr
    n = ((df[col] < lower) | (df[col] > upper)).sum()
    print(f"{col}: {n}개 (Lower={lower:.2f}, Upper={upper:.2f})")

sns.boxplot(data=df, x=target_col, y=numeric_cols[0]); plt.show()
plt.figure(figsize=(12, 10))
sns.heatmap(df[numeric_cols].corr(), annot=True, fmt=".2f", cmap="coolwarm", center=0); plt.show()
```

### 4.4 딥러닝 (이진 · 다중 · 회귀)

```python
import numpy as np
import pandas as pd
import tensorflow as tf
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, confusion_matrix, classification_report

df = pd.read_csv("wine.csv")
X = df.drop("Wine", axis=1).values
y = df["Wine"].values.astype(int) - 1         # 다중 분류: 0부터 시작하게
# 이진 분류: y = df["Outcome"].values
# 회귀:     y = df["BMI"].values, X에서 정답 열도 drop

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y    # 회귀면 stratify 삭제
)
scaler = StandardScaler()
X_train = scaler.fit_transform(X_train)
X_test = scaler.transform(X_test)

n_features = X_train.shape[1]
n_classes = 3

model = tf.keras.Sequential([
    tf.keras.Input(shape=(n_features,)),
    tf.keras.layers.Dense(32, activation="relu"),
    tf.keras.layers.Dense(16, activation="relu"),
    tf.keras.layers.Dense(n_classes, activation="softmax"),   # 이진: Dense(1, "sigmoid") / 회귀: Dense(1)
])
model.compile(
    optimizer="adam",
    loss="categorical_crossentropy",      # 이진: "binary_crossentropy" / 회귀: "mse"
    metrics=["accuracy"],                 # 회귀: ["mae"]
)
model.summary()

y_train_onehot = tf.keras.utils.to_categorical(y_train, num_classes=n_classes)   # 다중 분류만
history = model.fit(X_train, y_train_onehot, epochs=100, batch_size=32, validation_split=0.2, verbose=0)

y_prob = model.predict(X_test)
y_pred = np.argmax(y_prob, axis=1)                 # 이진: (y_prob >= 0.5).astype(int).flatten()

# 회귀는 아래 대신 MAE·RMSE로 평가: y_pred = y_prob.flatten() → mean_absolute_error, mean_squared_error ** 0.5
print("Accuracy =", accuracy_score(y_test, y_pred))
print(confusion_matrix(y_test, y_pred))
print(classification_report(y_test, y_pred, zero_division=0))
```

---

## 5. 자주 하는 실수 체크리스트

| 실수 | 증상 | 해결 |
| --- | --- | --- |
| 모델을 바꾸고 `predict`를 다시 안 함 | 모든 모델 점수가 똑같음 | 반복문 안에서 `y_pred = model.predict(X_test)` |
| 다른 데이터 셀을 실행한 뒤 위 셀을 재실행 | 열 이름·shape가 엉뚱함 | `X_test.columns`, `y_test.name`, `len(y_test)` 확인 후 처음부터 다시 실행 |
| `drop`에 `axis=1` 누락 | `KeyError: "... not found in axis"` | `df.drop("열", axis=1)` |
| 회귀 정답 열을 X에 남김 | 비정상적으로 좋은 점수 | 정답 열과 정답을 만든 열(mpg)까지 drop |
| 회귀에 `stratify=y` | 분할 오류 | 분류에만 사용 |
| 시험 데이터에 `fit_transform` | 데이터 누수 | 훈련은 `fit_transform`, 시험은 `transform` |
| 문자 열을 그대로 입력 | `could not convert string to float` | LabelEncoder / map / get_dummies |
| 순서 있는 입력에 LabelEncoder | SVM·로지스틱 성능 하락 | `map`으로 실제 순서 지정 |
| 결측치 `?`를 문자로 읽음 | 열이 object 자료형 | `na_values="?"` 후 `dropna()` |
| 불균형 데이터를 정확도만으로 평가 | 높은 정확도, 낮은 macro F1 | `f1_score(..., average="macro")`, 클래스별 recall |
| 딥러닝 입력 수에 정답 열 포함 | shape 오류 | 입력 수 = 전체 열 − 정답 열 |
| 다중 분류 정답이 1부터 시작 | 원핫 길이가 클래스 수 + 1 | `y - 1` 후 `to_categorical` |
| 다중 분류에 sigmoid + BCE | 학습이 이상함 | softmax + categorical_crossentropy |
| 회귀 출력층에 sigmoid | 예측이 0~1에 묶임 | 출력층 활성화 없음 + `mse` |
| 이진 분류 확률을 그대로 채점 | `accuracy_score` 오류 | `(y_prob >= 0.5).astype(int).flatten()` |
| 다중 분류 확률을 그대로 채점 | 형식 오류 | `np.argmax(y_prob, axis=1)` |
| `LogisticRegression` 수렴 경고 | `ConvergenceWarning` | `max_iter=1000`, 스케일링 |
