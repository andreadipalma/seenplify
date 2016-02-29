#! python
import Orange
import time

def domainInfo(data):
    print "The data domain ", data.domain
    print "Domain name ", data.domain.name
    print "Class:", data.domain.class_var.name
    print "Dimension of domain ", len(data.domain)
    print "Number of samples", len(data)-1
    m = len(data.domain.features)
    m_cont = sum(1 for x in data.domain.features if x.var_type==Orange.feature.Type.Continuous)
    m_disc = sum(1 for x in data.domain.features if x.var_type==Orange.feature.Type.Discrete)
    m_disc = len(data.domain.features)
    print "%d features, %d continuous and %d discrete" % (m, m_cont, m-m_cont)

def checkMode(inst, return_what):
    if (inst["class"]=="Walk"):
        return hi_class("MOVE")
    else:
        return hi_class("STEADY")

data = Orange.data.Table("../prepare_raw/merged/output_new.csv")
domain = data.domain
domainInfo(data)

# Add a new class attribute that has the values:
# MOVE - includes all the forms of active movement like walking, running, biking
# STEADY - inludes form of static positions, and driving, and other transportation modes

hi_class = Orange.feature.Discrete("hi_class", values=["MOVE", "STEADY"])
hi_class.get_value_from = checkMode
baseFeatures = [i for i in data.domain.features]
baseFeatures.extend([hi_class])
new_domain = Orange.data.Domain(baseFeatures)
newData = Orange.data.Table(new_domain, data)
domainInfo(newData)
newData.save('./new_data.csv')

# Add a new class attribute that has the values:
# MOVE - includes all the forms of active movement like walking, running, biking
# STEADY - inludes form of static positions, and driving, and other transportation modes

n = 15
ma = Orange.feature.scoring.score_all(newData)
best = Orange.feature.selection.top_rated(ma, n)
print 'Best %d features:' % n
for s in best:
    print s

bas = Orange.statistics.basic.Domain(newData)

print "%20s %5s %5s %5s" % ("feature", "min", "max", "avg")
for a in bas:
    if a:
        print "%20s %5.3f %5.3f %5.3f" % (a.variable.name, a.min, a.max, a.avg)
"""
starttime = time.time()
tree = Orange.classification.tree.TreeLearner(same_majority_pruning=1, m_pruning=2)
tree.name = "tree"

svm = Orange.classification.svm.SVMLearner(kernel_type=Orange.classification.svm.kernels.RBF,
                            normalization=True,
                            eps=1e-9)
svm.name = "svm"
res = Orange.evaluation.testing.cross_validation([tree, svm], newData, folds=5)
print "*** Tree performances ***"
print "Accuracy: %.2f" % Orange.evaluation.scoring.CA(res)[0]
print "AUC:      %.2f" % Orange.evaluation.scoring.AUC(res)[0]

print "*** SVM performances ***"
print "Accuracy: %.2f" % Orange.evaluation.scoring.CA(res)[1]
print "AUC:      %.2f" % Orange.evaluation.scoring.AUC(res)[1]

timetaken = time.time() - starttime
print "Training completed with %d samples in %d secs" % (len(newData), timetaken)
"""
